import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

interface MediaTagPicture {
  data: number[];
  format: string;
}

interface MediaTagPayload {
  tags?: {
    title?: string;
    artist?: string;
    album?: string;
    picture?: MediaTagPicture;
  };
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  pictureBlob?: Blob;
}

export const readAudioMetadata = (file: File): Promise<AudioMetadata> => new Promise((resolve) => {
  jsmediatags.read(file, {
    onSuccess: (tag: MediaTagPayload) => {
      const picture = tag.tags?.picture;
      const pictureBlob = picture?.data && picture.format
        ? new Blob([new Uint8Array(picture.data)], { type: picture.format })
        : undefined;

      resolve({
        title: tag.tags?.title,
        artist: tag.tags?.artist,
        album: tag.tags?.album,
        pictureBlob,
      });
    },
    onError: () => resolve({}),
  });
});
