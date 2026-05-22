import React from 'react';import{createRoot}from'react-dom/client';import App from './App.jsx';import './styles.css';
const client=window.ZAFClient?window.ZAFClient.init():null;if(client)client.invoke('resize',{width:'100%',height:'620px'});
createRoot(document.getElementById('root')).render(<App client={client}/>);
