import React, { useEffect, useState } from 'react';
import { Link }                       from 'react-router-dom';
import moment                         from 'moment';
import Loading                        from './Loading';
import firebase                       from '../Functions/Firebase';
import '../Styles/OneYearAgo.css';

const OneYearAgo = () => {
    
    const [posts, setPosts] = useState([]);
    
    useEffect(() => {
        
        let lastYearStartOfWeek = moment().subtract(1, 'year').startOf('week').valueOf();
        
        let ref = firebase.database().ref('posts').orderByChild('timeStamp').startAt(lastYearStartOfWeek).limitToFirst(5);
        
        let listener = ref.on('value', snapshot => {
           
            if(snapshot.val()){
                
                let lastYearPosts = Object.entries(snapshot.val());
                
                setPosts(lastYearPosts);
                
            }
            else{
                
                setPosts([]);
                
            }
            
            
        });
        
        return () => ref.off('value', listener);
        
    }, [])
    
    return(
        <React.Fragment>
            { posts.length > 0
            ? <div className = 'OneYearAgo'>
                <span className = 'Title'>Hace un año...</span>
                <div className = 'Articles'>
                {posts.map(([url, {title, replies = {}, votes, views}]) => (
                    <div className = 'Article' key = {url}>
                        <Link to = {`/comunidad/post/${url}`}>{title}</Link>    
                        <p>{Object.keys(replies).length} {Object.keys(replies).length === 1 ? 'comentario' : 'comentarios'}</p>
                    </div>
                ))}
                </div>
             </div>
            : <Loading type = 'OneYearAgo'/>    
            }
        </React.Fragment>
    );
    
}

export default OneYearAgo;