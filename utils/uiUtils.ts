
export const formatTime = (time: number) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getTextStyle = (
    size: number, 
    color: string | null, 
    isBold: boolean, 
    isItalic: boolean,
    defaultColorClass: string
) => {
    return {
        style: {
          fontSize: `${size}px`,
          color: color || undefined,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
        },
        className: color ? '' : defaultColorClass
    };
};
