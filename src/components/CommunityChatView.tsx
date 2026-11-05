import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Smile,
  Paperclip,
  CheckCheck,
} from 'lucide-react';
import { ChatMessage, ChatGroup, User } from '../types';

interface CommunityChatViewProps {
  groups: ChatGroup[];
  activeGroupId: string;
  onSelectGroup: (groupId: string) => void;
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (groupId: string, text: string) => Promise<ChatMessage>;
  onPlayChime: () => void;
}

export const CommunityChatView: React.FC<CommunityChatViewProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  messages,
  currentUser,
  onSendMessage,
  onPlayChime,
}) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const groupMessages = messages.filter((m) => m.groupId === activeGroupId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      await onSendMessage(activeGroupId, inputText.trim());
      setInputText('');
      onPlayChime();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row h-[75vh]">
      {/* Left Channel Sidebar */}
      <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Digital Channels</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Zero-paper community consultation
          </p>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {groups.map((group) => {
            const isCurrent = group.id === activeGroupId;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup(group.id)}
                className={`w-full text-left p-3 rounded-xl transition flex items-start gap-2.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                    : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hash className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate">
                    {group.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {group.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/60">
        {/* Channel Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {activeGroup?.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                {activeGroup?.description}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {activeGroup?.membersCount} Registered Members
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {groupMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px]">
                  <span className="font-bold text-slate-300">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                    {msg.role}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message #${activeGroup?.name || 'channel'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
