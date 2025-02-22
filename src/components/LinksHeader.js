import React from 'react';

const LinksHeader = () => {
    return (
        <header style={{ backgroundColor: 'teal', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: 'white' }}>
            <div style={{ fontSize: '1.5em', padding: '10px' }}>My Logo</div>
            <nav style={{ display: 'flex', gap: '20px' }}>
                <a href="#home" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px' }}>Home</a>
                <a href="#map" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px' }}>Map</a>
                <a href="#about" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px' }}>About</a>
                <a href="#contact" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px' }}>Contact</a>
            </nav>
        </header>
    );
};

export default LinksHeader;
