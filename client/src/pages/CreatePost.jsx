import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import {useState} from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import PropagateLoader from "react-spinners/PropagateLoader"


export default function CreatePost(){
    const [title,setTitle]=useState('');
    const [summary,setSummary]=useState('');
    const [content,setContent]=useState('');
    const[files,setFiles]=useState('');
   const [redirect,setRedirect]=useState(false);
   const [loading, setLoading] = useState(false);

   const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

  async function createNewPost(ev){
        const data=new FormData();
        data.set('title',title);
        data.set('summary',summary);
        data.set('content',content);
data.set('file',files[0]);

setLoading(true)
ev.preventDefault();
const response=await fetch('/api/post',{
    method:'POST',
    body:data,
    credentials:'include',
    });
    setLoading(false)
    if(response.ok){
setRedirect(true);
    }
    }

if(redirect){
   return <Navigate to={'/'}/>
}

if (loading) {
    return (
        <div style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            width:"100%",
            height:"500px",
        }}>
            {loading && (<div>
                <PropagateLoader
                    color="#36d7b7"
                    loading={loading}
                    cssOverride={override}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>)}
        </div>
    )
}

    return(
        <form onSubmit={createNewPost}>
            <input type="title"
             placeholder={'Title'} 
             value={title}
              onChange={ev=>setTitle(ev.target.value)}/>
            <input type="summary"
             placeholder={'Summary'}
             value={summary}
             onChange={ev=>setSummary(ev.target.value)}
             />
            <input type="file" 
            onChange={ev=>setFiles(ev.target.files)}/>
              <Editor value={content} onChange={setContent}/>
            <button style={{marginTop:'5px'}}>Create Post</button>
        </form>
    );
}