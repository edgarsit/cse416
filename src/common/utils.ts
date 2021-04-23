const capitalize = (s: string) => {
  if (s.length > 0) {
    return s[0]?.toUpperCase() + s.slice(1);
  }
  return s;
};

export const toView = (s: string): string => {
  if (s === 'sbuId') {
    return 'SBU ID';
  }
  return s.split(/([A-Z][^A-Z]*)/).map(capitalize).join(' ');
};
