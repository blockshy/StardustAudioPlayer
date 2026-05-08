declare module 'jsmediatags/dist/jsmediatags.min.js' {
  interface ReadOptions<T = unknown> {
    onSuccess: (tag: T) => void;
    onError: (error: unknown) => void;
  }

  const jsmediatags: {
    read: <T = unknown>(file: File | Blob, options: ReadOptions<T>) => void;
  };

  export default jsmediatags;
}
