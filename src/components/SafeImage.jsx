import React, { useState, useEffect } from 'react';

/**
 * SafeImage Component
 * 
 * Bypasses the ngrok browser warning page by fetching the image via JavaScript
 * with the 'ngrok-skip-browser-warning' header, and converting the response to a blob Object URL.
 * Also upgrades HTTP URLs to HTTPS for ngrok domains to avoid mixed content block.
 */
const SafeImage = ({ src, alt, style, className }) => {
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    if (!src) {
      setCurrentSrc('');
      return;
    }

    // If it's a local preview url (blob:) or inline data url, use it directly
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      setCurrentSrc(src);
      return;
    }

    let isMounted = true;
    let objectUrl = '';

    // Upgrade HTTP to HTTPS for ngrok tunnels to avoid Mixed Content block
    let secureSrc = src;
    if (secureSrc.startsWith('http://') && secureSrc.includes('ngrok-free.dev')) {
      secureSrc = secureSrc.replace('http://', 'https://');
    }

    // Fetch the image with the bypass header
    fetch(secureSrc, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setCurrentSrc(objectUrl);
        }
      })
      .catch((error) => {
        console.error('SafeImage load error:', error);
        // Fallback to the original URL (or upgraded URL) if fetch fails
        if (isMounted) {
          setCurrentSrc(secureSrc);
        }
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return <img src={currentSrc || src} alt={alt} style={style} className={className} />;
};

export default SafeImage;
