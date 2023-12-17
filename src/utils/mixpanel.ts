import mixpanel from 'mixpanel-browser';
import { isEnv } from './misc';

const actions = {
  track: (name: string, props?: Object | undefined) => {
    if (isEnv('dev')) {
      console.log(`[Mixpanel] ${name}`, props);
    }
    mixpanel.track(`[Studio] ${name}`, props);
  },
  alias: (id: string) => {
    if (isEnv('dev')) {
      console.log(`[Mixpanel] alias`, id);
    }
    mixpanel.alias(id);
  },

  trackPageview: (props?: Object | undefined) => {
    if (isEnv('dev')) {
      console.log(`[Mixpanel] track page`, props);
    }
    mixpanel.track_pageview(props);
  },
};

export let Mixpanel = actions;
