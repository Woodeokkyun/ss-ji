import { api } from '.';

export const postFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<{ uploadedUrl: string }>('/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
