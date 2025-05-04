import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <img
      src="https://drive.google.com/thumbnail?id=1sNslh1tb7KlGm5ELSJII3kZ4KQEKBu7O&sz=w1000"
      alt="JEMURAN Logo"
      className={className}
    />
  );
};

export default Logo;