import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ReactQuill from "react-quill";
import Editor from "../Editor";
import { useParams } from "react-router-dom";
import PropagateLoader from "react-spinners/PropagateLoader"

export default function EditPost(){
    const {id}=useParams();
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
      

        useEffect(() => {
          setLoading(true)
            fetch('/api/post/'+id)
              .then(response => {
                response.json().then(postInfo => {
                  setLoading(false)
                  setTitle(postInfo.title);
                  setContent(postInfo.content);
                  setSummary(postInfo.summary);
                });
              });
          }, []);

  async function updatePost(ev){
    ev.preventDefault();
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('id', id);
    if (files?.[0]) {
      data.set('file', files?.[0]);
    }
    setLoading(prev => true)
    const response = await fetch('/api/post', {
      method: 'PUT',
      body: data,
      credentials: 'include',
    });
    
    if (response.ok){
      setLoading((prev) => false)
      setRedirect(true);

    }
  }

        if(redirect){
            return <Navigate to={'/post/'+id}/>
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
                 <form onSubmit={updatePost}>
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
                     <ReactQuill 
                     value={content} 
                      onChange={newValue=>setContent(newValue)} 
                       />
                       <Editor onChange={setContent} value={content}/>
                     <button style={{marginTop:'5px'}}>Update Post</button>
                 </form>
             );
         }
