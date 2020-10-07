import React, { useEffect, useState } from 'react';
import { auth }                       from '../Functions/Firebase';
import '../Styles/Ad.css';

const Ad = () => {
    
    const [displayAds, setDisplayAds] = useState(false);
    
    useEffect(() => { 
        
        if(displayAds && window.screen.width >= 768)
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        
    }, [displayAds]);
    
    useEffect(() => {
        
        auth.onAuthStateChanged(user => {
            
            if(user){
              
                setDisplayAds(false);
                
            }
            else{
                
                setDisplayAds(true);
                
            }
            
        });
        
    }, []);
    
    return(
        <React.Fragment>
            { displayAds
            ? <div  className = 'Ad'>
                <div className = 'Ad-Wrap'>
                    <ins
                        className      = 'adsbygoogle'
                        style          = {{ display: 'inline-block', width: '280px', height: '280px'}}
                        data-ad-client = 'ca-pub-8817836333583401'
                        data-ad-slot   = '6658079014'>
                    </ins>
                </div>
              </div>
            : null    
            }
        </React.Fragment>
    );
    
};

export default Ad;