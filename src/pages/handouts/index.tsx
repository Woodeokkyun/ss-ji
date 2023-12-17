import Image from '@/components/common/Image';
import Layout from '@/components/common/Layout';
import { MAX_WIDTH } from '@/styles/css';
import { Theme, css, useTheme } from '@emotion/react';
import { NextPage } from 'next';
import { Fragment, useEffect, useState } from 'react';
import {
  Radius,
  Sizes,
  Spacing,
  Toggle,
  Typography,
} from 'solvook-design-system';
import { Delete, Sale, Icon } from 'solvook-design-system/icon';
import { deleteStudioHandout, getStudioHandouts } from '@/api/studioHandouts';
import { usePaginationQuery } from '@/utils/query';
import Pagination from '@/components/common/Pagination';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Mixpanel } from '@/utils/mixpanel';
import mixpanel from 'mixpanel-browser';

const HandoutList = () => {
  useEffect(() => {
    /* @ts-ignore */
    if (!mixpanel.__loaded) {
      return;
    }

    Mixpanel.track('Page Viewed', {
      page: 'Handout list',
    });
  }, [
    /* @ts-ignore */
    mixpanel.__loaded,
  ]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOnlyForSale, setIsOnlyForSale] = useState(false);
  const query = usePaginationQuery(
    ['studioHandouts', isOnlyForSale],
    ({ pageParam }) => {
      return getStudioHandouts({ offset: pageParam, isOnlyForSale });
    },
    {
      suspense: false,
    }
  );
  const { mutate: removeHandout } = useMutation(
    (handoutId: string) => deleteStudioHandout(handoutId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['studioHandouts', isOnlyForSale]);
      },
    }
  );

  const [hasNext, setHasNext] = useState<boolean>();

  const { data } = query;

  const changeOnlyForSale = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOnlyForSale(e.target.checked);
    query.remove();
  };

  useEffect(() => {
    const pagination = data?.pages[data?.pages.length - 1]?.pagination;
    const hasNext =
      pagination && pagination?.total > pagination?.offset + pagination?.limit;
    setHasNext(hasNext);
  }, [data]);

  return (
    <div css={HandoutsWrapperCSS}>
      <div
        css={HandoutBannerCSS}
        onClick={() => {
          window.open('https://studio-blog.solvook.com/pyeon/', '_blank');
        }}
      />
      <div css={HandoutsListHeaderCSS}>
        <p>최근 편집 순</p>
        <div className="sale-toggle">
          <p>판매 가능한 자료만 보기</p>
          <Toggle
            name="sale-available"
            onChange={changeOnlyForSale}
            checked={isOnlyForSale}
          />
        </div>
      </div>
      <div css={HandoutsListCSS}>
        <div className="create-handout">
          <div>
            <p>최상위권 학생에게 최적화된 수업자료를 만들어보세요.</p>
            <button onClick={() => router.push('/handouts/load')}>
              + 새 학습지 만들기
            </button>
          </div>
        </div>
        {data?.pages.map((page, i) => {
          return (
            <Fragment key={`handouts-${i}`}>
              {page.data.map((handout) => (
                <div
                  key={`handout-${handout.id}`}
                  className="handout-card"
                  onClick={() =>
                    router.push(
                      `${process.env.NEXT_PUBLIC_SOLVOOK_URL}/viewer/${handout.licenseId}/?studio=true`
                    )
                  }
                >
                  <div className="handout-card__header">
                    <span>{handout.itemCount} 문제</span>
                  </div>
                  <h5>
                    {handout.title.length > 0 ? handout.title : '제목 없음'}
                  </h5>
                  <p>
                    {handout.updatedAt &&
                      `${dayjs(handout.updatedAt).format(
                        'YYYY. MM. DD. HH:mm'
                      )}에 마지막 수정`}
                  </p>

                  <div className="handout-card__footer">
                    <div className="handout-card__footer__btn-wrap">
                      {handout.isForSale && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `${process.env.NEXT_PUBLIC_SOLVOOK_URL}/mypage/stores/products/new`
                            );
                          }}
                        >
                          <Icon icon={Sale} size={Sizes.small} /> 판매하기
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const c = confirm(
                            '정말 삭제하시겠습니까?\n삭제한 자료는 복구할 수 없습니다.'
                          );
                          if (!c) {
                            return;
                          }
                          removeHandout(handout.id);
                        }}
                      >
                        <Icon icon={Delete} size={Sizes.small} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
      {hasNext && <Pagination query={query} />}
    </div>
  );
};

const HandoutsPage: NextPage = () => {
  const theme = useTheme();
  return (
    <Layout
      withoutMenu
      backgroundColor={theme.var.sol_gray_0}
      header={
        <div css={HandoutsHeaderCSS}>
          <div>
            <Image
              className="banner-pc"
              src="/assets/logo.png"
              alt="logo"
              width={144}
              height={40}
            />
            <button
              onClick={() =>
                window.open('https://solstudio.solvook.com', '_blank')
              }
            >
              제품 소개
            </button>
            <button
              onClick={() =>
                window.open('https://studio-blog.solvook.com/', '_blank')
              }
            >
              활용 사례
            </button>
          </div>
        </div>
      }
    >
      <HandoutList />
    </Layout>
  );
};

export default HandoutsPage;

const HandoutsWrapperCSS = css`
  padding: 0 ${Spacing.large}px;
`;

const HandoutBannerCSS = css`
  margin-top: ${Spacing.xlarge}px;
  max-width: 1200px;
  aspect-ratio: 1200 / 240;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background-image: url('/assets/handout_banner.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  // .banner-mobile {
  //   display: none;
  // }

  @media (max-width: 1024px) {
    aspect-ratio: 1024 / 240;
    background-image: url('/assets/handout_banner_t.png');
  }

  @media (max-width: 768px) {
    margin-top: 0;
    aspect-ratio: 780 / 480;
    width: calc(100% + 40px);
    margin-left: -${Spacing.large}px;
    background-image: url('/assets/handout_banner_m.png');
  }
`;

const HandoutsHeaderCSS = (theme: Theme) => css`
  background-color: ${theme.var.white};
  padding: ${Spacing.xlarge}px;

  > div {
    max-width: ${MAX_WIDTH}px;
    margin: 0 auto;
    padding-left: ${Spacing.large}px;
    display: flex;
    align-items: center;
    gap: 32px;

    button {
      color: ${theme.var.gray600};

      &:hover {
        color: ${theme.var.black};
      }
    }
  }
`;

const HandoutsListHeaderCSS = (theme: Theme) => css`
  margin-top: ${Spacing.xlarge}px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  > p {
    ${Typography.body14}
    color: ${theme.var.gray600};
    font-weight: 700;
  }

  .sale-toggle {
    display: flex;
    align-items: center;
    gap: ${Spacing.xsmall}px;
    color: ${theme.var.gray600};

    p {
      ${Typography.body14}
    }
  }
`;

const HandoutsListCSS = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${Spacing.medium}px;
  margin-top: ${Spacing.xlarge}px;
  padding-bottom: ${Spacing.xlarge}px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }

  > div {
    padding: ${Spacing.large}px;
    background-color: ${theme.var.white};
    border-radius: ${Radius.large}px;
    height: 174px;
  }

  .handout-card {
    position: relative;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    box-sizing: border-box;

    &__header {
      display: flex;
      margin-bottom: ${Spacing.xxsmall}px;

      span {
        border: 1px solid ${theme.var.sol_gray_100};
        background-color: ${theme.var.sol_gray_50};
        color: ${theme.var.gray600};
        border-radius: ${Radius.xsmall}px;
        padding: ${Spacing.xxxsmall}px ${Spacing.xxsmall}px;
        ${Typography.body12}
      }
    }

    &__footer {
      display: flex;
      justify-content: end;
      align-items: center;
      margin-top: auto;

      p {
        ${Typography.body12}
        color: ${theme.var.gray600};
      }

      &__btn-wrap {
        display: flex;
        gap: ${Spacing.xsmall}px;

        button {
          ${Typography.body14}
          border-radius: ${Radius.xsmall}px;
          border: 1px solid ${theme.var.sol_gray_100};
          background-color: ${theme.var.white};
          color: ${theme.var.gray600};
          padding: ${Spacing.xsmall}px ${Spacing.small}px;
          display: flex;
          align-items: center;
          gap: ${Spacing.xxsmall}px;

          &:hover {
            background-color: ${theme.var.gray25};

            .handout-card {
              box-shadow: none !important;
              background-color: ${theme.var.white} !important;
            }
          }
        }
      }
    }

    h5 {
      margin-bottom: ${Spacing.xxsmall}px;
      line-height: 1.5;
    }

    p {
      ${Typography.body14}
      color: ${theme.var.gray600};
    }

    &:hover {
      box-shadow: 0 0 0 1px ${theme.colors.sol_indigo_500} inset;
      background-color: ${theme.colors.indigo0};
    }
  }

  .create-handout {
    display: flex;
    justify-content: center;
    align-items: center;

    > div {
      text-align: center;

      p {
        gray: ${theme.var.gray600};
        ${Typography.body16}
        margin-bottom: ${Spacing.xlarge}px;
      }

      button {
        ${Typography.body14}
        font-weight: 600;
        padding: ${Spacing.xsmall}px ${Spacing.medium}px;
        border-radius: ${Radius.small}px;
        background-color: ${theme.colors.sol_indigo_500};
        line-height: 1.5;
        color: ${theme.var.white};
      }
    }
  }
`;
