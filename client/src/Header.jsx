import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";

export default function Header() {
  const[username,setUsername]=useState(null);
  useEffect(()=>{
fetch('/api/profile',{
  credentials:'include',
}).then(response=>{
response.json().then(userInfo=>{
setUsername(userInfo.username);
})
});
  },[]);

function logout(){
  fetch('/api/logout',{
    credentials:'include',
    method:'POST',
  })
}

  return (
    <header>
      <Link to="/" className="logo">
        MyBlog
      </Link>
      <nav>
        {username && (
          <>
          <Link to="/api/create">Create new post</Link>
          <a onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
<Link to="/login">Login</Link>
<Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
