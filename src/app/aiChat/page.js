"use client";
import React, { useState, useEffect, useRef } from "react";
import { isMobile, isIOS } from "react-device-detect";
import backArrow from "../assets/svg/barrow.svg";
import Image from "next/image";
import refresh from "../assets/svg/refresh.svg";
import cam from "../assets/svg/cam.svg";
import send from "../assets/svg/send.svg";
import dot from "../assets/svg/aiDot.svg";
import SuggestionContainer from "../components/suggestionContainer";
import Loader from "../components/loader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CameraCapture from "../components/cameraCapture";

const AiChat = ({ searchParams }) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [threadId, setThreadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,setSent] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(searchParams?.isScan);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  const headerRef = useRef(null);
  const inputAreaRef = useRef(null);

  useEffect(() => {
    const initialMessage = {
      type: 1,
      message: "Thank you for visiting our store! 😊 How can I help with your skincare needs today?",
      suggestions: [],
    };
    setMessagesList([initialMessage]);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

        textareaRef.current.focus();
    
    }
  }, [message]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // if (textareaRef.current) {
    //   headerRef.current.scrollIntoView({ behavior: "smooth" });
    // }
  }, [messagesList]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (chatAreaRef.current && headerRef.current && inputAreaRef.current) {
  //       const headerHeight = headerRef.current.offsetHeight;
  //       const inputHeight = inputAreaRef.current.offsetHeight;
  //       const viewportHeight = window.innerHeight;
  //       chatAreaRef.current.style.height = `${viewportHeight - headerHeight - inputHeight}px`;
  //     }
  //   };

  //   const handleViewportChange = () => {
  //     if (chatAreaRef.current && headerRef.current && inputAreaRef.current) {
  //       const headerHeight = headerRef.current.offsetHeight;
  //       const inputHeight = inputAreaRef.current.offsetHeight;
  //       const visualViewportHeight = window.visualViewport.height;
  //       chatAreaRef.current.style.height = `${visualViewportHeight - headerHeight - inputHeight}px`;
  //     }
  //   };

  //   const handleFocus = () => {
  //     if (isMobile && chatAreaRef.current && headerRef.current && inputAreaRef.current) {
  //       const headerHeight = headerRef.current.offsetHeight;
  //       const inputHeight = inputAreaRef.current.offsetHeight;
  //       const viewportHeight = window.innerHeight;
  //       chatAreaRef.current.style.height = `${(viewportHeight - headerHeight - inputHeight) / 2}px`;

  //       if (isIOS) {
  //         // Scroll to the bottom on iOS to prevent input from being hidden by the keyboard
  //         setTimeout(() => {
  //           chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  //         }, 3000);
  //       }
  //     }
  //   };

  //   const handleBlur = () => {
  //     if (isMobile) {
  //       handleResize();
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   window.visualViewport.addEventListener("resize", handleViewportChange);
  //   window.visualViewport.addEventListener("scroll", handleViewportChange);

  //   if (textareaRef.current) {
  //     textareaRef.current.addEventListener("focus", handleFocus);
  //     textareaRef.current.addEventListener("blur", handleBlur);
  //   }

  //   handleResize();
  //   handleViewportChange();

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //     window.visualViewport.removeEventListener("resize", handleViewportChange);
  //     window.visualViewport.removeEventListener("scroll", handleViewportChange);

  //     if (textareaRef.current) {
  //       textareaRef.current.removeEventListener("focus", handleFocus);
  //       textareaRef.current.removeEventListener("blur", handleBlur);
  //     }
  //   };
  // }, []);

  const makeApiCall = async (messageText, showResponse = false) => {
    console.log(showResponse, "showResponse");
    setSent(true);
    if (showResponse) {
      const res = await fetch("https://walrus-app-hs2a9.ondigitalocean.app/assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: threadId,
          question: JSON.stringify(messageText),
        }),
      });
      const data = await res.json();
      setThreadId(data.thread_id || threadId);
    } else {
      const userMessage = messageText || message;
      setMessagesList([...messagesList, { type: 0, message: userMessage }]);
      setMessage("");
      setLoading(true);

      const res = await fetch("https://walrus-app-hs2a9.ondigitalocean.app/assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: threadId,
          question: userMessage,
        }),
      });
      const data = await res.json();
      setLoading(false);
      setThreadId(data.thread_id || threadId);
      addBotMessage(data.response, data.suggestions, data?.products);
    }

    // Close the keyboard
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleRefresh = () => {
    const initialMessage = {
      type: 1,
      message: "Thank you for visiting our store! 😊 How can I help with your skincare needs today?",
      suggestions: [],
    };
    setMessagesList([initialMessage]);
    setThreadId("");
    setMessage("");
  };

  const addBotMessage = (response, suggestions, products) => {
    let currentIndex = 0;
    const botMessage = {
      type: 1,
      message: "",
      suggestions: suggestions || [],
      image: products ? products : null,
    };

    const typingEffect = setInterval(() => {
      if (currentIndex < response?.length) {
        botMessage.message += response[currentIndex];
        setMessagesList((prevMessagesList) => [...prevMessagesList.slice(0, -1), botMessage]);
        currentIndex++;
      } else {
        clearInterval(typingEffect);
      }
    }, 50);

    if (botMessage?.image) {
      console.log(botMessage.image, "botMessage");
      makeApiCall(botMessage.image, true);
    }

    setMessagesList((prevMessagesList) => [...prevMessagesList, botMessage]);
  };

  const handleCapture = (file) => {
    setIsCameraOpen(false);
    setMessagesList([
      ...messagesList,
      {
        type: 0,
        message: "Photo captured",
        images: [URL.createObjectURL(file)],
      },
    ]);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file, "captured.jpeg");

    fetch("https://walrus-app-hs2a9.ondigitalocean.app/assistant/scan", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log(response, "lkfjdslkf");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((res) => {
        makeApiCall(res, true);
        console.log(res, "lkfjdslkf");
        setLoading(false);
        setThreadId(res.thread_id || threadId);
        addBotMessage("", [], [
          {
            featured_image: res.image_url,
            title: res.product_name,
            benefits: res.benefits,
            url: res.product_url,
            description: res.description,
          },
        ]);
        console.log("Scan result:", res);
      })
      .catch((error) => {
        console.error("Error during file upload:", error);
      });
  };

  return (
    <div className={`${ textareaRef.current ? "h-[500px]": " h-[930px]"}  flex justify-between flex-col bg-[#F4FBFB]`}>
      {isCameraOpen && (
        <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
      )}
      {/* Header */}
      <div ref={headerRef} className="header  sticky top-0 bg-[#F4FBFB] z-10">
        <div className="flex justify-between px-3 pt-3">
          <div onClick={() => router.push("/dashboard")}>
            <Image src={backArrow} alt="back" />
          </div>
          <div onClick={handleRefresh}>
            <Image src={refresh} alt="refresh" />
          </div>
        </div>
        <hr className="border-[0.3px] border-customCyan mt-3" />
      </div>

      {/* Chat Area */}
      <div
        ref={chatAreaRef}
        className=" flex-grow  font-sans overflow-y-auto p-3"
        style={{ flex: "1 1 auto" }}
      >
        {messagesList.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === 0 ? "justify-end" : "justify-start"
            } mb-2`}
          >
            {msg.type === 1 && (
              <div className="flex flex-col items-start">
                <div className="flex gap-4 justify-center items-center font-light">
                  <div>
                    <Image src={dot} alt="dot" />
                  </div>
                  <div className="text-xs text-black opacity-60">
                    Wardah AI Assistant -
                  </div>
                </div>
                {msg.image && msg.image.length > 0 ? (
                  <div className="flex flex-col gap-2 mx-5 my-2">
                    <div className="flex flex-row flex-wrap gap-6">
                      {msg.image.map((img, idx) => (
                        <Link href={img.url} target="_blank" key={idx}>
                          <div className="w-[150px] border rounded-md p-2 font-light">
                            <img
                              src={img.featured_image}
                              alt="Product"
                              width={150}
                              height={150}
                            />
                            <div className="text-[12px] font-medium">
                              {img.title}
                            </div>
                            <div className="text-wrap text-[12px]">
                              {img.benefits}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-aiChatBg px-4 py-2 mx-5 my-2 max-w-[80%] text-base font-light text-black">
                    {msg.message}
                  </div>
                )}

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mx-5 max-w-[80%]">
                    {msg.suggestions.map((suggestion, idx) => (
                      <SuggestionContainer
                        key={idx}
                        text={suggestion}
                        handleClick={() => makeApiCall(suggestion)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {msg.type === 0 && (
              <div className="flex flex-col items-end overflow-x-hidden">
                <div className="rounded-2xl break-words bg-white px-2 py-2 mx-5 my-2 max-w-[80%] text-base font-light text-black h-auto">
                  {msg.message}
                </div>
                {msg.images && msg.images.length > 0 && (
                  <div className="mt-2">
                    {msg.images.map((image, idx) => (
                      <div key={idx} className="w-[150px] p-2 font-light">
                        <img src={image} alt="Captured" width={150} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <Loader />}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div
        ref={inputAreaRef}
        className="input-area w-screen flex items-center border border-[#E6E6E6] justify-center gap-4 py-4 px-5 bg-white"
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type a message"
          className="w-full h-auto flex-1 outline-none focus:outline-none resize-none bg-none no-scrollbar"
          rows={1}
        />
        {!message ? (
          <div
            onClick={() => setIsCameraOpen(true)}
            className="w-10 h-10 flex justify-center items-center cursor-pointer"
          >
            <Image src={cam} alt="cam" />
          </div>
        ) : (
          <div
            onClick={() => makeApiCall()}
            className="w-10 h-10 flex justify-center items-center cursor-pointer"
          >
            <Image src={send} alt="send" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChat;
