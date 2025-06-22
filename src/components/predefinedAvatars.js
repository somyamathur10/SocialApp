// A collection of simple, minimalist SVG avatars.

const Avatar1 = (props) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="40" cy="40" r="40" fill="#A5B4FC" />
    <rect x="20" y="30" width="40" height="20" rx="10" fill="#4338CA" />
  </svg>
);

const Avatar2 = (props) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="40" cy="40" r="40" fill="#F9A8D4" />
    <path d="M20 50 C20 30, 60 30, 60 50 Z" fill="#BE185D" />
  </svg>
);

const Avatar3 = (props) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="40" cy="40" r="40" fill="#A7F3D0" />
    <path d="M40 20 L60 55 L20 55 Z" fill="#047857" />
  </svg>
);

const Avatar4 = (props) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="40" cy="40" r="40" fill="#FDE68A" />
    <circle cx="30" cy="30" r="10" fill="#D97706" />
    <circle cx="50" cy="50" r="10" fill="#D97706" />
  </svg>
);

const Avatar5 = (props) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="40" cy="40" r="40" fill="#BFDBFE" />
    <path d="M25 25 L55 55 M55 25 L25 55" stroke="#1D4ED8" strokeWidth="8" />
  </svg>
);

const Avatar6 = (props) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="40" cy="40" r="40" fill="#FECACA" />
    <circle cx="40" cy="40" r="25" stroke="#991B1B" strokeWidth="8" />
  </svg>
);


export const avatars = {
  avatar1: Avatar1,
  avatar2: Avatar2,
  avatar3: Avatar3,
  avatar4: Avatar4,
  avatar5: Avatar5,
  avatar6: Avatar6,
};