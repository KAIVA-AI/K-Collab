import React from 'react';
import { IListTopic } from '../../constants/chatbox'; // Import the IListTopic interface if it’s declared in a separate file
import './chat-topic-list.css';
import {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
interface ChatTopicListProps {
    topics: IListTopic[];
    onSelectTopic: (topic: IListTopic) => void;
    onEditTopic?: (topic: IListTopic) => void;
    onDeleteTopic?: (topic: IListTopic) => void;
}

const ChatTopicList: React.FC<ChatTopicListProps> = ({ topics, onSelectTopic, onEditTopic, onDeleteTopic }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedTopicName, setEditedTopicName] = useState<string>("");

    const handleEditClick = (index: number, currentName: string) => {
        setEditingIndex(index); // Set the topic to edit mode
        setEditedTopicName(currentName); // Set the current topic name as the value
    };

    const handleSaveClick = async (topic: IListTopic) => {
        if (onEditTopic && editedTopicName) {
            await onEditTopic({ ...topic, name: editedTopicName }); // Call the onEditTopic callback
        }
        setEditingIndex(null); // Exit edit mode
    };

    return (
        <div className="chat-topic-list">
            <input 
                type="text" 
                placeholder="Search chats..." 
                className="search-bar" 
            />
            <ul className="topic-list">
                {topics.map((topic, index) => (
                    <li key={index} className="topic-item">
                        <div className="topic-content" onClick={() => onSelectTopic(topic)}>
                            {editingIndex === index ? (
                                <input
                                    type="text"
                                    value={editedTopicName}
                                    onChange={(e) => setEditedTopicName(e.target.value)}
                                    className="edit-input"
                                />
                            ) : (
                                <span className="topic-name">{topic.name}</span>
                            )}
                            <span className="topic-timestamp">{topic.timestamp}</span>
                        </div>
                        <div className="topic-actions">
                            {editingIndex === index ? (
                                <button
                                    className="save-button"
                                    onClick={() => handleSaveClick(topic)}
                                >
                                    💾 Save
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditClick(index, topic.name)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => onDeleteTopic?.(topic)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatTopicList;
