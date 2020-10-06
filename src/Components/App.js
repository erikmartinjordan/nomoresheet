import React, { useEffect, useState } from 'react';
import { Switch, Route, withRouter }  from 'react-router-dom';
import Fingerprint                    from 'fingerprintjs';
import moment                         from 'moment';
import Forum                          from './Forum';
import Detail                         from './Detail';
import Post                           from './Post';
import Default                        from './Default';
import Blog                           from './Blog';
import Nav                            from './Nav';
import Footer                         from './Footer';
import Acerca                         from './Acerca';
import PublicInfo                     from './PublicInfo';
import Stats                          from './Stats';
import Privacy                        from './Privacy';
import Guidelines                     from './Guidelines';
import Helper                         from './Helper';
import DonateSuccess                  from './DonateSuccess';
import DonateFail                     from './DonateFail';
import firebase                       from '../Functions/Firebase';
import '../Styles/App.css';

const App  = ({history}) => {
    
    const [sessionId, setSessionId] = useState(null);
    
    let fingerprint = new Fingerprint().get();
    
    let date = moment();
    
    let ref = firebase.database().ref(`analytics/${date.format('YYYYMMDD')}/${fingerprint}`);
    
    useEffect( () => {
        
        let sessionId  = ref.push().key;
        let pageviewId = ref.child(sessionId).push().key;
        
        let timeStamp = { 
            timeStampIni: date.valueOf(), 
            timeStampEnd: date.valueOf()
        };
        
        let url = { 
            url: history.location.pathname
        };
        
        let updates = {};
        
        updates = timeStamp;
        updates.pageviews = {};
        updates.pageviews[pageviewId] = url;
        
        ref.child(sessionId).update(updates);
        
        setSessionId(sessionId);
        
    }, [date, history.location.pathname, ref]);
    
    useEffect( () => {
        
        if(sessionId){
            
            ref.child(`${sessionId}/pageviews`).push({ url: history.location.pathname });
            
        }
        
    }, [history.location.pathname]);
    
    useEffect( () => {
        
        let scrollListener;
        
        if(sessionId && history.location.pathname !== '/estadisticas'){
            
            scrollListener = window.addEventListener('scroll', () => {
            
                ref.child(`${sessionId}/timeStampEnd`).transaction( value => (new Date()).getTime() );
            
            });
        }
        
        return () => window.removeEventListener('scroll', scrollListener); 
        
    }, [sessionId, history.location.pathname]);
   
    return (
        <React.Fragment>
            <Helper/>
            <div className = 'Title-Menu'>
                <Switch key = 'A'>
                    <Route                                     component = {Nav}/>
                 </Switch>
                <Switch  key = 'B'>
                    <Route exact path = '/'                    component = {Forum}/>
                    <Route exact path = '/blog'                component = {Blog}/>
                    <Route exact path = '/acerca'              component = {Acerca}/>
                    <Route exact path = '/estadisticas'        component = {Stats}/>
                    <Route exact path = '/privacidad'          component = {Privacy}/>
                    <Route exact path = '/guias'               component = {Guidelines}/>
                    <Route exact path = '/donateSuccess'       component = {DonateSuccess}/>
                    <Route exact path = '/donationFail'        component = {DonateFail}/>
                    <Route path = '/comunidad/post/:string'    component = {Detail}/>
                    <Route path = '/tag/:string'               component = {Forum}/>
                    <Route path = '/@:string'                  component = {PublicInfo}/>
                    <Route path = '/:string'                   component = {Post}/>
                    <Route                                     component = {Default}/>
                </Switch>
            </div>
            <Switch key = 'C'>
                <Route                                         component = {Footer}/>
            </Switch>
        </React.Fragment>
    );
}

export default withRouter(App);