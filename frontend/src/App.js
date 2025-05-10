import bridge from "@vkontakte/vk-bridge";
import {
    AdaptivityProvider,
    AppRoot,
    Button,
    ConfigProvider,
    Div,
    Panel,
    SplitCol,
    SplitLayout,
    Textarea,
    View,
} from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";
import {AnimatePresence, motion} from "framer-motion";
import React, {useEffect, useRef, useState} from "react";

// Массив вопросов для чата
const questions = [
    "Расскажи о своей текущей работе. Чем ты занимаешься и какие задачи решаешь? Какие навыки и профессиональные компетенции наиболее важны в твоей сфере?",
    "Любишь ли ты точность и технические детали, или тебе ближе творчество и воображение?",
    "Что тебя по-настоящему вдохновляет? Есть ли хобби или занятия, которые заряжают тебя энергией?",
    "Ты больше чувствуешь себя творческим человеком (креатив, искусство, нестандартные идеи) или техническим (логика, системы, точные решения)?",
    " Если бы от твоего выбора прямо сейчас зависела жизнь другого человека — но с риском для себя — как думаешь, что бы ты сделал?",
    " Есть ли у тебя тяга к заботе о здоровье — своём и окружающих — или тебя больше влечёт работа руками, с механизмами и конструкциями?",
];
// Основной компонент приложения
const App = () => {
    // Состояния приложения
    const [activePanel, setActivePanel] = useState("intro"); // Текущая активная панель
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Индекс текущего вопроса
    const [messages, setMessages] = useState([]); // Сообщения в чате
    const [answers, setAnswers] = useState([]); // Ответы пользователя
    const [input, setInput] = useState(""); // Текст ввода пользователя
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [finished, setFinished] = useState(false); // Завершён ли опрос
    const [characterImage, setCharacterImage] = useState(null); // Изображение персонажа
    const [characterImageBase64, setCharacterImageBase64] = useState(null); // Изображение в base64
    const [fontsLoaded, setFontsLoaded] = useState(false); // Загружены ли шрифты
    const messagesEndRef = useRef(null); // Референс для автоскролла
    const [showNotification, setShowNotification] = useState(true); // Показывать ли уведомление


    // Минимальное время ожидания экрана загрузки (в мс) чтоб шрифты успели прогрузиться
    const MIN_LOADING_TIME = 4500;
    const [loadingStartTime] = useState(Date.now());

    // Ожидание загрузки всех шрифтов с учетом минимальной задержки
    useEffect(() => {
        document.fonts.ready.then(() => {
            const elapsed = Date.now() - loadingStartTime;
            const delay = Math.max(0, MIN_LOADING_TIME - elapsed);
            setTimeout(() => setFontsLoaded(true), delay);
        });
    }, [loadingStartTime]);

    // Определяем, поддерживает ли устройство сенсорный ввод (для автоскролла) ибо автоскролл на десктопе НА ВК работает ужасно 
    const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    // Эффект для отслеживания изменения размера окна
    useEffect(() => {
        const handleResize = () => {
            setViewportHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Эффект для автоскролла в конец чата (только для сенсорных устройств)
    useEffect(() => {
        if (isTouchDevice && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messages, isTouchDevice, viewportHeight]);

    // useEffect для отправки сообщения после показа картинки
    useEffect(() => {
        if (characterImage) {
            setMessages((prev) => {
                const alreadyAdded = prev.some(
                    (msg) => msg.text.includes("Вот твой результат")
                );
                if (alreadyAdded) return prev;

                return [
                    ...prev,
                    {
                        text: 'Откройте для себя вдохновляющую историю этого Героя и ещё 80 подвигов на нашем сайте — <a href="https://герои-времени.рф" target="_blank" rel="noopener noreferrer" style="color: #30663d; text-decoration: underline;">герои-времени.рф</a>. Погрузитесь в летопись мужества и доблести!',
                        from: "gpt",
                        key: Date.now(),
                        isHtml: true,
                    },
                ];
            });
        }
    }, [characterImage]);

    // Эффект для инициализации первого сообщения при переходе в чат
    useEffect(() => {
        if (activePanel === "chat" && messages.length === 0) {
            setMessages([{text: questions[0], from: "gpt", key: Date.now()}]);
        }
    }, [activePanel, messages.length]);
    // Функция отправки ответа
    const sendAnswer = async () => {
        if (!input.trim()) return;

        const answerText = input.trim();
        const questionText = questions[currentQuestionIndex];
        // Добавление сообщения пользователя
        const userMessage = {text: answerText, from: "user", key: Date.now()};
        const updatedAnswers = [
            ...answers,
            {question: questionText, answer: answerText},
        ];

        setMessages((prev) => [...prev, userMessage]);
        setAnswers(updatedAnswers);
        setInput("");
        setLoading(true);
        const nextIndex = currentQuestionIndex + 1;

        // Обработка следующего вопроса или завершение опроса
        if (nextIndex < questions.length) {
            setTimeout(() => {
                const nextMessage = {
                    text: questions[nextIndex],
                    from: "gpt",
                    key: Date.now(),
                };
                setMessages((prev) => [...prev, nextMessage]);
                setCurrentQuestionIndex(nextIndex);
                setLoading(false);
            }, 700);
        } else {
            setFinished(true);
            try {
                // Добавление финального сообщения
                setMessages((prev) => [
                    ...prev,
                    {
                        text: "Ai проанализировал твои ответы и твоя история очень похожа на.....",
                        from: "gpt",
                        key: Date.now(),
                    },
                ]);
                // Получение данных пользователя VK, то-есть автоматическая авторизация, иначе ниче не будет работать
                const userData = await bridge.send('VKWebAppGetUserInfo');
                
                // Отправка ответов на сервер
                const res = await fetch(
                    "https://xn-----dlccdmca1acd3bode5aey.xn--p1ai:8000/chat/send",
                    {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            user_id: userData.id,
                            username: `${userData.first_name} ${userData.last_name}`,
                            answers: updatedAnswers,
                        }),
                    }
                );

                if (!res.ok) throw new Error("Image response failed");
                
                // Обработка полученного изображения вида bite64
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result;
                    setCharacterImage(dataUrl);
                    setCharacterImageBase64(dataUrl.split(",")[1]);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                setMessages((prev) => [
                    ...prev,
                    {text: "Хм... Попробуйте еще раз!", from: "gpt", key: Date.now()},
                ]);
            }

            setLoading(false);
        }
    };
    // Рендер сообщений чата
    const renderMessages = () => (
        <Div>
            <AnimatePresence initial={false}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.key}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        transition={{duration: 0.3}}
                        style={{
                            display: "flex",
                            justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                            marginBottom: 10,
                        }}
                    >
                        <div
                            style={{
                                background: msg.from === "user" ? "#f0e8dd" : "#e3d5c4",
                                color: "#1c1c1c",
                                padding: "10px 14px",
                                borderRadius: "16px",
                                display: "inline-block",
                                maxWidth: "75%",
                                wordBreak: "break-word",
                            }}
                        >
                            {msg.isHtml ? (
                                <span dangerouslySetInnerHTML={{__html: msg.text}}/>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {/* Элемент для автоскролла */}
            <div ref={messagesEndRef}/>
        </Div>
    );

    // Отображаем экран загрузки, пока не загружены все шрифты
    if (!fontsLoaded) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "#FDF7F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                }}
            >
                <div className="loader"></div>
            </div>
        );
    }

    // Основной рендер приложения
    return (
        <ConfigProvider>
            <AdaptivityProvider>
                <div
                    className="theme"
                    style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        backgroundColor: "#FDF7F0",
                    }}
                >
                    <AppRoot>
                        <SplitLayout style={{width: "100%", height: "100%"}}>
                            <SplitCol style={{width: "100%", height: "100%"}}>
                                <View activePanel={activePanel}>
                                    {/* первое окно, где написано описание приложения */}
                                    <Panel id="intro">
                                        //фон
                                        <Div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                minHeight: "100vh",
                                                backgroundColor: "#fdf7f0",
                                                padding: 0,
                                            }}
                                        >
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="https://i.pinimg.com/736x/01/90/d6/0190d61dbacf5e04320ca41c47da3d6c.jpg"
                                                    alt="Вдохновители"
                                                    style={{
                                                        width: "100%",
                                                        objectFit: "cover",
                                                        maxHeight: "200px",
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: "20%",
                                                        left: "10%",
                                                        color: "#254E2E",
                                                        font: "Anticva",
                                                        fontSize: "20px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                             {/* буковки, которые читать можно */}
                                        
                                                    БЛАГО ОБЩЕЕ <br/> ВЫШЕ МОЕГО
                                                </div>
                                            </div>

                                            <Div
                                                style={{
                                                    padding: "20px",
                                                    background: "#ffffff",
                                                    borderRadius: "12px",
                                                    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        color: "#6C828D",
                                                        font: "montserrat",
                                                        lineHeight: "1.6",
                                                    }}
                                                >
                                                    Добро пожаловать в приложение{" "}
                                                    <strong>«Кто ты из героев прошлого?»</strong> — часть
                                                    проекта <strong>«Вдохновители»</strong>.
                                                </p>
                                                <p
                                                    style={{
                                                        color: "#6C828D",
                                                        font: "montserrat",
                                                        lineHeight: "1.6",
                                                    }}
                                                >
                                                    Этот сервис создан, чтобы каждый мог почувствовать
                                                    личную связь с историей Великой Отечественной войны.
                                                </p>
                                                <p
                                                    style={{
                                                        color: "#6C828D",
                                                        font: "CodeNext",
                                                        lineHeight: "1.6",
                                                    }}
                                                >
                                                    Отвечай на вопросы, рассказывая о себе — свободно и
                                                    искренне.
                                                    <br/>
                                                    После этого ты узнаешь, на кого из героев прошлого ты
                                                    похож.
                                                    <br/>И сможешь поделиться результатом в соцсетях.
                                                </p>
                                            </Div>
                                            <div
                                                style={{
                                                    position: "sticky",
                                                    bottom: 0,
                                                    backgroundColor: "#f0e8dd",
                                                    padding: "12px 16px",
                                                    zIndex: 10,
                                                }}
                                            >
                                                {/* кнопка для перехода к чату */}
                                                <Button
                                                    size="l"
                                                    stretched
                                                    style={{
                                                        marginTop: 8,
                                                        backgroundColor: "#30663d",
                                                        color: "#b6d3b6",
                                                    }}
                                                    onClick={() => setActivePanel("chat")}
                                                >
                                                    Начать
                                                </Button>
                                            </div>
                                        </Div>
                                    </Panel>
                                    {/* чат */}
                                    <Panel id="chat">
                                        <div
                                        {/* фон */}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                height: "100vh",
                                                position: "relative",
                                                background: "#FDF7F0",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    backgroundColor: "#f0e8dd",
                                                    padding: "12px 16px",
                                                    borderBottom: "1px solid #aaa",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    position: "fixed",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    zIndex: 20,
                                                }}
                                            >
                                                {/* а это фаще кайф, типо в переписываетесь с другим пользователем, плашка сверху, у которой */}
                                                {/* пишется "печатает..." при отправке сообщений */}
                                                <img
                                                    src="https://i.pinimg.com/736x/01/90/d6/0190d61dbacf5e04320ca41c47da3d6c.jpg"
                                                    alt="Твой герой победы"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        marginRight: 12,
                                                    }}
                                                />
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontSize: 16,
                                                            color: "#254E2E",
                                                        }}
                                                    >
                                                        Твой герой победы
                                                    </div>
                                                    {loading && (
                                                        <div style={{fontSize: 12, color: "#1c1c1c"}}>
                                                            печатает...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* уведа о том, что вк - помойка */}
                                            {showNotification && (
                                                <div
                                                    style={{
                                                        backgroundColor: "#e0d5c0", 
                                                        padding: "10px 14px",
                                                        borderBottom: "1px solid #ccc",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        position: "fixed",
                                                        top: 65, 
                                                        left: 0,
                                                        right: 0,
                                                        zIndex: 19,
                                                    }}
                                                >
                                                    <div style={{color: "#254E2E", fontSize: 14}}>
                                                        Если ВК некорректно опубликует историю с карточкой героя,
                                                        обновите приложение или попробуйте с другого устройства.
                                                    </div>
                                                    <button
                                                        onClick={() => setShowNotification(false)}
                                                        style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            fontSize: 18,
                                                            cursor: "pointer",
                                                            color: "#254E2E",
                                                        }}
                                                        aria-label="Закрыть уведомление"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    flex: "1 1 auto",
                                                    overflowY: "auto",
                                                    padding: "16px",
                                                    paddingTop: showNotification ? 65 : 0, // высота уведомления
                                                    marginTop: 60, // ШАПКА всегда фиксирована 60px
                                                }}
                                            >
                                                {/* основная часть чата */}
                                                {renderMessages()}
                                                
                                                {characterImage && (
                                                    <motion.div
                                                        initial={{opacity: 0, scale: 0.9}}
                                                        animate={{opacity: 1, scale: 1}}
                                                        transition={{duration: 0.5}}
                                                    >
                                                        <Div>
                                                            <img
                                                                src={characterImage}
                                                                alt="Character"
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    height: "auto",
                                                                    borderRadius: "8px",
                                                                    marginTop: "20px",
                                                                    maxHeight: "400px",
                                                                }}
                                                            />
                                                        </Div>
                                                    </motion.div>
                                                )}
                                            </div>
                                            {!finished ? (
                                                {/* отправка соо */}
                                                <div
                                                    style={{
                                                        position: "sticky",
                                                        bottom: 0,
                                                        backgroundColor: "#f0e8dd",
                                                        padding: "12px 16px",
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    <Textarea
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                e.preventDefault();
                                                                sendAnswer();
                                                            }
                                                        }}
                                                        placeholder="Введите ответ..."
                                                        style={{
                                                            backgroundColor: "rgba(84,129,84,0.76)",
                                                            color: "#1c1c1c",
                                                            borderRadius: "12px",
                                                            padding: "10px",
                                                            fontSize: "16px",
                                                            resize: "none",
                                                        }}
                                                    />
                                                    <Button
                                                        size="l"
                                                        stretched
                                                        style={{
                                                            marginTop: 8,
                                                            backgroundColor: "#30663d",
                                                            color: "#b6d3b6",
                                                        }}
                                                        onClick={sendAnswer}
                                                        loading={loading}
                                                    >
                                                        Отправить
                                                    </Button>
                                                </div>
                                            ) : characterImage ? (
                                            {/* картинка */}
                                                <Div
                                                    style={{
                                                        padding: "16px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "12px",
                                                        backgroundColor: "#fdf7f0",
                                                        borderTop: "1px solid #ddd",
                                                    }}
                                                >
                                                    <Button
                                                        size="l"
                                                        stretched
                                                        style={{
                                                            backgroundColor: "#30663d",
                                                            color: "#ffffff",
                                                        }}
                                                        onClick={async () => {
                                                            {/* можно сделать репост, даже кнопка вставится с ссылкой на приложение */}

                                                            if (!characterImage) return;
                                                            try {
                                                                await bridge.send("VKWebAppShowStoryBox", {
                                                                        background_type: "image",
                                                                        blob: characterImage,
                                                                        attachment: {
                                                                            text: 'open',
                                                                            type: 'url',
                                                                            url: "https://vk.com/app53519220"
                                                                        }
                                                                    }
                                                                )
                                                                {/* в бд добавляем статистику, скока было сделано сторис */}
                                                                const res = await fetch(
                                                                    "https://xn-----dlccdmca1acd3bode5aey.xn--p1ai:8000/edit_stat",
                                                                    {method: "POST"}
                                                                );


                                                            } catch (err) {
                                                                console.error("Ошибка шэринга:", err);
                                                            }
                                                        }}
                                                    >
                                                            {/* кнопочки с переходом по ссылками и отправке сторис */}
                                                        Рассказать о моем герое в ВК историях
                                                    </Button>
                                                    <Button
                                                        size="l"
                                                        stretched
                                                        style={{
                                                            backgroundColor: "#30663d",
                                                            color: "#ffffff",
                                                        }}
                                                        href="https://xn--b1aaffobumib0c5a.xn--p1ai/"
                                                        target="_blank"
                                                    >
                                                        Узнать больше о движении Вдохновители
                                                    </Button>
                                                    <Button
                                                        size="l"
                                                        stretched
                                                        style={{
                                                            backgroundColor: "#30663d",
                                                            color: "#ffffff",
                                                        }}
                                                        href="https://xn----dtbbicare8alexe.xn--p1ai/"
                                                        target="_blank"
                                                    >
                                                        Узнать истории других героев
                                                    </Button>
                                                </Div>
                                            ) : null}
                                        </div>
                                    </Panel>
                                </View>
                            </SplitCol>
                        </SplitLayout>
                    </AppRoot>
                </div>
            </AdaptivityProvider>
        </ConfigProvider>
    );
};
//усе
export default App;

