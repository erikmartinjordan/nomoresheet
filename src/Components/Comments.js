import React                    from 'react';
import { Link }                 from 'react-router-dom';
import buildFormatter           from 'react-timeago/lib/formatters/buildFormatter';
import spanishStrings           from 'react-timeago/lib/language-strings/es';
import TimeAgo                  from 'react-timeago';
import Loading                  from './Loading';
import UserAvatar               from './UserAvatar';
import GetLastComments          from '../Functions/GetLastComments';
import '../Styles/Comments.css';

const formatter = buildFormatter(spanishStrings);

const Comments = () => {
    
    const comments = GetLastComments(10);
    
    return(
        <React.Fragment>
        { comments.length !== 0
        ? <div className = 'Comments'>
            <span className = 'Title'>Últimos comentarios</span>
            <div className = 'LastComments'>
                {comments.map( (comment, key) =>
                <Link to = {`/comunidad/post/${comment.postId}`} key = {key} className = 'Info'>
                    <div className = 'Info-Wrap'>
                        <UserAvatar user = {{uid: comment.userUid, photoURL: comment.userPhoto}}/>
                        <div className = 'Author-Date'>
                            <span>{comment.userName}</span>
                            <span><TimeAgo formatter = {formatter} date = {comment.timeStamp}/></span>
                        </div>
                    </div>
                </Link>
                )}
            </div>
        </div>
        : <Loading type = 'Comments'/>
        }
        </React.Fragment>
    );
}

export default Comments;