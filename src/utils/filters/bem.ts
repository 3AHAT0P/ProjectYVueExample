export default (blockName: string, elementName: string, mods: Hash) => {
  /* eslint-disable-next-line */
  const template = `${blockName}${elementName && `__${elementName}` || ''}`;
  if (mods == null) return template;
  return (Object as any).entries(mods).reduce(([key, value]: any[]) => {
    if (value === '@') return `${template}--${key}`;
    return `${template}--${key}-${value}`;
  }, [template]).join(' ');
};
