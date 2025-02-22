import React, { useState } from 'react';
import './App.css';
import GoogleMap from './components/GoogleMap';
import Header from './components/Header';
import TabsHeader from './components/TabsHeader';
import CallsList from './components/CallsList';
import DetailsForm from './components/DetailsForm';

function App() {
    const [activeTab, setActiveTab] = useState('Map');
    const [selectedCall, setSelectedCall] = useState(null);

    const renderContent = () => {
        switch (activeTab) {
            case 'Map':
                return <GoogleMap />;
            case 'About':
                return <div>About Us</div>;
            case 'Contact':
                return <div>Contact Us</div>;
            case 'Details':
                return <DetailsForm selectedCall={selectedCall} />;
            default:
                return <GoogleMap />;
        }
    };

    const handlePickUp = (call) => {
        setSelectedCall(call);
        setActiveTab('Details');
    };

    return (
        <div className="App">
            <Header />
            <TabsHeader onTabChange={setActiveTab} />
            <main style={{ display: 'flex', height: 'calc(100vh - 80px)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex' }}>
                    {renderContent()}
                </div>
                <CallsList onPickUp={handlePickUp} />
            </main>
        </div>
    );
}

export default App;
