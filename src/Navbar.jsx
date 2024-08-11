import { faShare,faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {useEffect, useState } from "react";
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteDataFromFirestore, fetchDataFromFirestore } from "./firebase";

function Navbar(props){
  const {setSaveQuestion,setAnswer,saveChat,setSaveChat} = props;
  const [forceRender, setForceRender] = useState(0);
    let route ="#"
    const showId=(id)=>{
      const chatItem = saveChat.find(chat => chat.id === id);
      if (chatItem) {
        setSaveQuestion(chatItem.question);
        setAnswer(chatItem.response);
      } 
    };
    const deleteResponse=(id)=>{
      let arr=saveChat
      let docId =-1;
      for(let i=0;i<arr.length;i++){
        if(arr[i].id === id){
          docId=arr[i].docId;
          arr.splice(i,1);
        }
      }
      console.log(id);
      if(docId!==-1) deleteDataFromFirestore(docId);
      setSaveChat(arr);
      setForceRender(forceRender+1); 
      toast.warning("Deleted chat");
    }
    useEffect(() => {
      const getData = async () => {
        const fetchedData = await fetchDataFromFirestore();
        setSaveChat(fetchedData);
      };
      getData();
    },[]);
    return (
      <nav className="navbar navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href={route}>
            Brainiac
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                History
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              {saveChat.length > 0 && (
                <div className="card ">
                  <ul className="list-group list-group-flush">
                    {saveChat.map((chat) => (
                      <li key={chat.id} className="list-group-item">
                        {chat.question}
                        <div className="mb-5">
                        <FontAwesomeIcon
                          icon={faShare}
                          flip="horizontal"
                          className="custom"
                          style={{ cursor: "pointer" }}
                          onClick={() => showId(chat.id)}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="custom-delete"
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteResponse(chat.id)}
                        />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
}
export default Navbar