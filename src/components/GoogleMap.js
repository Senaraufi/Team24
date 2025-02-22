import React, { useState } from 'react';

const GoogleMap = () => {
    const [mapSrc, setMapSrc] = useState(`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=EPIC+The+Irish+Emigration+Museum`);

    return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', padding: '16px' }}>
            <div style={{ width: '100%' }}>
                <iframe
                    width="100%"
                    height="400px"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: '12px' }}
                    src={mapSrc}
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default GoogleMap;
