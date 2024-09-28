import { Box, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import Navbar from "./Navbar";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "dompurify";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveDataToFirestore } from "./firebase";

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState({ question: "" });
  const [saveQuestion, setSaveQuestion] = useState("");
  const [saveChat, setSaveChat] = useState([]);
  const handleChange = (e) => {
    setQuestion(e.target.value);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      // Prevent form submission and add a new line
      event.preventDefault();
      setQuestion(event.target.value + "\n");
    }
  };
  const validate = (fieldValues = question) => {
    let temp = { ...errors };
    temp.question = fieldValues ? "" : "This field is required.";
    setErrors({
      ...temp,
    });
    return temp.question === "";
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(question)) {
      setSaveQuestion(question);
      setLoader(true);
      run();
    } else {
      console.log("Form has errors");
    }
  };
  async function run() {
    const prompt = `
    You are a Brainiac assistant chatbot, I am here to help with your queries. Please answer the following question in a simple and concise manner, using bullet points:
    - Provide clear and direct answers
    - Avoid unnecessary details 
    - Ensure the response is easy to understand
    
    Question: ${question}`;
    try {
      const result = await model.generateContent(prompt);

      if (result.response) {
        const text = result.response.text();
        setAnswer(text);
        setQuestion("");
      } else {
        console.error("Model did not generate a response.");
        setAnswer(
          "I couldn't understand your question. Please try rephrasing it."
        );
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setAnswer("Something went wrong. Please try again later.");
    } finally {
      setLoader(false);
    }
  }

  const formatAnswer = (text) => {
    const formattedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>")
      .replace(/## (.*?)(\n|$)/g, "<h2>$1</h2>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
    return DOMPurify.sanitize(formattedText);
  };

  const copyToClipboard = () => {
    const textarea = document.createElement("textarea");
    textarea.value = answer;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success("Copied chat");
  };

  const onEdit = () => {
    setQuestion(saveQuestion);
  };
  const saveResponse = () => {
    let ind = saveChat.map((s) => s.question).indexOf(saveQuestion);
    console.log(ind);
    let obj = { id: uuidv4(), question: saveQuestion, response: answer };
    if (ind === -1) {
      setSaveChat((prevSaveChat) => [...prevSaveChat, obj]);
      saveDataToFirestore(obj);
      toast.success("Saved chat");
    }
  };

  useEffect(() => {
    console.log(saveChat);
  }, [saveChat]);

  return (
    <div className="App">
      <div>
        <header className="p-5">
          <Navbar
            saveChat={saveChat}
            setSaveChat={setSaveChat}
            setSaveQuestion={setSaveQuestion}
            setAnswer={setAnswer}
          />
        </header>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <div className="d-flex justify-content-center">
            <div id="input" className="card col-auto col-md-6">
              <div className="card-body">
                <TextField
                  id="question"
                  label="Message Brainiac"
                  variant="standard"
                  fullWidth
                  value={question}
                  required
                  onKeyDown={handleKeyDown}
                  onChange={handleChange}
                  {...(errors.question && {
                    error: true,
                    helperText: errors.question,
                  })}
                />
              </div>
              <FontAwesomeIcon
                id="sendIcon"
                icon={faPaperPlane}
                size="xl"
                onClick={handleSubmit}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        </Box>
        {loader && (
          <div className="text-center mt-5">
            <FontAwesomeIcon
              icon={faSpinner}
              spinPulse
              style={{ color: "#f7f3f3" }}
              size="2xl"
            />
          </div>
        )}
        {saveQuestion && !loader && (
          <div id="responseCard" className="d-flex justify-content-center mt-4">
            <div className="col-md-6 card border-dark mb-3 ">
              <div id="headerDiv" className="card-header">
                <p id="customWidth">
                  <b>{saveQuestion}</b>
                </p>
                <div>
                  <span className="m-1" style={{ cursor: "pointer" }}>
                    <i class="bi bi-pencil" onClick={onEdit}></i>
                  </span>
                  <span className="m-1" style={{ cursor: "pointer" }}>
                    <i
                      class="bi bi-clipboard2-check-fill"
                      onClick={copyToClipboard}
                    ></i>
                  </span>

                  <span className="m-1" style={{ cursor: "pointer" }}>
                    <i class="bi bi-floppy" onClick={saveResponse}></i>
                  </span>
                </div>
              </div>
              <div className="card-body text-dark">
                <p
                  dangerouslySetInnerHTML={{ __html: formatAnswer(answer) }}
                ></p>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={1000} closeOnClick />
      </div>
    </div>
  );
}

export default App;
