import React, { useState } from 'react';

const TabsHeader = ({ onTabChange }) => {
    const [activeTab, setActiveTab] = useState('Home');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        onTabChange(tab);
    };

    return (
        <header style={{ backgroundColor: 'teal', padding: '10px', color: 'white', textAlign: 'center' }}>
            <nav>
                <button 
                    onClick={() => handleTabClick('Home')} 
                    style={{ 
                        padding: '10px', 
                        backgroundColor: activeTab === 'Home' ? 'darkcyan' : 'teal', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        marginRight: '10px', 
                        transition: 'background-color 0.3s' 
                    }}
                >
                    Home
                </button>
                <button 
                    onClick={() => handleTabClick('Map')} 
                    style={{ 
                        padding: '10px', 
                        backgroundColor: activeTab === 'Map' ? 'darkcyan' : 'teal', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'background-color 0.3s' 
                    }}
                >
                    Map
                </button>
                <button 
                    onClick={() => handleTabClick('About')} 
                    style={{ 
                        padding: '10px', 
                        backgroundColor: activeTab === 'About' ? 'darkcyan' : 'teal', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'background-color 0.3s' 
                    }}
                >
                    About
                </button>
                <button 
                    onClick={() => handleTabClick('Contact')} 
                    style={{ 
                        padding: '10px', 
                        backgroundColor: activeTab === 'Contact' ? 'darkcyan' : 'teal', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'background-color 0.3s' 
                    }}
                >
                    Contact
                </button>
                <button 
                    onClick={() => handleTabClick('Details')} 
                    style={{ 
                        padding: '10px', 
                        backgroundColor: activeTab === 'Details' ? 'darkcyan' : 'teal', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'background-color 0.3s' 
                    }}
                >
                    Details
                </button>
            </nav>
        </header>
    );
};

export default TabsHeader;
