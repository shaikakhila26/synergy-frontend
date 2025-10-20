import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Peer as SimplePeer } from 'simple-peer';
import { Camera, Mic, MicOff, Video, VideoOff, PhoneOff, Users, Share2, MessageCircle, MoreVertical, Layout, Plus, Minimize2 ,Calendar,Link,Paperclip,Smile } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../AuthProvider';
import COLORS from '../../styles/colors'; // Assuming COLORS is defined for the selector UI
import { ToastContainer , toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JoinMeetingForm from '../VideoCall/JoinMeetingForm';



// --- New Dark Theme Colors (Inspired by the image) ---
const DARK_THEME = {
  bg: '#1f2022', // Very dark grey background
  surface: '#292b2d', // Dark grey for controls/panels
  text: '#ffffff',
  accent: '#5e94ff', // A blue accent for active elements
  danger: '#ea4335', // Red for hang-up button
  header: '#3c4043', // Header bar color
};

// Original gradient for the outer shell/selector
const bgGradient = `linear-gradient(120deg, ${COLORS.pink} 0%, ${COLORS.blue} 100%)`;

// Utility to generate a name for remote peers in the tile
const generatePeerName = (id, idx) => {
  // A simple way to get a consistent name/color based on the ID
  const names = ["Janella Yuen", "Joe Carson", "Lucy Sera", "Sitta Johns", "Leonard David", "Rachal Green", "Carol Smith", "Monica Geller"];
  return names[idx % names.length];
};

export default function WorkspaceMeetingUI() {
  const socket = useSocket();
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  const { user } = useAuth();

  const [selectedWorkspace, setSelectedWorkspace] = useState(activeWorkspaceId || '');
  const [view, setView] = useState('select'); // select | lobby | meeting | schedule

  // meeting
  const [meetingId, setMeetingId] = useState('');
  const [meetingPass, setMeetingPass] = useState('');
  const [createdBy, setCreatedBy] = useState(null);
  const [peers, setPeers] = useState({});
  const peersRef = useRef({});

  // media
  const myVideo = useRef();
  const mainVideoRef = useRef(); // New ref for the large video tile
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // To simulate active speaker

  // chat (Hidden by default in meeting to match image, but logic remains)
  const [chatOpen, setChatOpen] = useState(false); // Changed to false to match image UI focus
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef();

  // color helper (for avatars/borders) - adapting to dark theme accents
  function getColor(idx) {
    return [DARK_THEME.accent, COLORS.pink, COLORS.yellow, COLORS.purple][idx % 4];
  }

  useEffect(() => {
    if (activeWorkspaceId) setSelectedWorkspace(activeWorkspaceId);
  }, [activeWorkspaceId]);

  function genMeetingId() {
    return Math.random().toString(36).slice(2, 9).toUpperCase();
  }

  function createMeeting({ allowSetPass = true } = {}) {
    const id = genMeetingId();
    setMeetingId(id);
    setCreatedBy(user?.id || 'me');
    if (allowSetPass) setMeetingPass('');
    setView('lobby');
  }

  function scheduleMeeting(dateISO) {
    // stub: integrate with calendar API or server-side scheduling
    setView('select');
  }

  // Effect to manage local stream display in lobby
  useEffect(() => {
    if (myVideo.current && localStream) {
      myVideo.current.srcObject = localStream;
      myVideo.current.play().catch(() => {}); // FIXED: ensure play()
    }
  }, [localStream]);
  
  // Effect to manage local stream display in meeting (main tile)
  useEffect(() => {
    if (mainVideoRef.current && localStream) {
      mainVideoRef.current.srcObject = localStream;
      mainVideoRef.current.play().catch(() => {}); // FIXED: ensure play()
    }
  }, [localStream]);

  // media setup
  async function startLocalStream() {
    try {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      s.getAudioTracks().forEach(t => (t.enabled = micOn));
      s.getVideoTracks().forEach(t => (t.enabled = camOn));
      setLocalStream(s);
      if (myVideo.current) 
      {
        myVideo.current.srcObject = s;
      myVideo.current.play().catch(() => {}); // FIXED: ensure play()
      }
      if (mainVideoRef.current) 
      {
        mainVideoRef.current.srcObject = s;
        mainVideoRef.current.play().catch(() => {}); // FIXED: ensure play()
      }
    } catch (err) {
      console.error('Unable to get local media', err);
      toast.error('Unable to access camera and microphone'); // Optional UX improvement
    }
  }

  useEffect(() => {
    return () => {
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(p => p.destroy && p.destroy());
      peersRef.current = {};
    };
  }, []);

  // meeting & peer signaling (Kept as-is, assuming simple-peer is configured correctly)
  useEffect(() => {
    if (!socket) return;

    socket.on('meeting-created', ({ id, host }) => {});
    socket.on('meeting-join-request', ({ meetingId: id, from }) => {});
    socket.on('user-joined', (userId) => {
      if (!localStream) return;
      if (userId === socket.id) return;
      const peer = createPeer(userId, socket.id, localStream);
      peersRef.current[userId] = peer;
      setPeers(prev => ({ ...prev, [userId]: { peer, name: generatePeerName(userId, Object.keys(prev).length) } }));
    });
    socket.on('signal', ({ from, signal }) => {
      const item = peersRef.current[from];
      if (item) {
        item.signal(signal);
      } else {
        if (!localStream) return;
        const peer = addPeer(signal, from, localStream);
        peersRef.current[from] = peer;
        setPeers(prev => ({ ...prev, [from]: { peer, name: generatePeerName(from, Object.keys(prev).length) } }));
      }
    });
    socket.on('user-left', (id) => {
      if (peersRef.current[id]) {
        peersRef.current[id].destroy && peersRef.current[id].destroy();
        delete peersRef.current[id];
        setPeers(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    });
    return () => {
      socket.off('meeting-created');
      socket.off('meeting-join-request');
      socket.off('user-joined');
      socket.off('signal');
      socket.off('user-left');
    };
  }, [socket, localStream]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => {
      socket.emit('signal', { to: userToSignal, signal, meetingId });
    });
    peer.on('stream', remoteStream => {});
    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => {
      socket.emit('signal', { to: callerId, signal, meetingId });
    });
    peer.signal(incomingSignal);
    peer.on('stream', remoteStream => {});
    return peer;
  }

  // actions
  const handleStartMeeting = async () => {
    if (!selectedWorkspace) 
    {
      toast.error('Please select a workspace first');
      return;
    }
    if (!meetingId) createMeeting({ allowSetPass: false });
    await startLocalStream();
    socket.emit('create-meeting', { meetingId, workspace: selectedWorkspace, host: user?.id });
    socket.emit('join-meeting', { meetingId, userId: socket.id });
    setView('meeting');
  };

  const handleJoinMeeting = async ({ id, pass }) => {
    if (!id) {
  toast.error('Please enter a meeting ID');
  return;
}

    setMeetingId(id);
    await startLocalStream();
    socket.emit('join-meeting', { meetingId: id, userId: socket.id });
    setView('meeting');
  };

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
    setMicOn(v => !v);
  };

  function getBlankTrack() {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const stream = canvas.captureStream();
    return stream.getVideoTracks()[0];
  }

 // --- toggleCam fix ---
const toggleCam = async () => {
  if (!localStream) return;

  const videoTrack = localStream.getVideoTracks()[0];

  if (camOn) {
    // replace with blank track for peers
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    canvas.getContext('2d').fillRect(0, 0, 640, 480);
    const blankTrack = canvas.captureStream().getVideoTracks()[0];

    Object.values(peersRef.current).forEach(peer => {
      const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
      sender?.replaceTrack(blankTrack);
    });

    videoTrack.enabled = false;
    setCamOn(false);
    if (mainVideoRef.current) mainVideoRef.current.srcObject = null; // show placeholder
  } else {
    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const newTrack = newStream.getVideoTracks()[0];

    localStream.removeTrack(videoTrack);
    localStream.addTrack(newTrack);

    Object.values(peersRef.current).forEach(peer => {
      const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
      sender?.replaceTrack(newTrack);
    });

    if (myVideo.current) myVideo.current.srcObject = localStream;
    if (mainVideoRef.current) mainVideoRef.current.srcObject = localStream;

    setCamOn(true);
  }
};

// --- toggleScreenShare fix ---
const toggleScreenShare = async () => {
  if (!isSharing) {
    try {
      const disp = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
        sender?.replaceTrack(disp.getVideoTracks()[0]);
      });

      if (mainVideoRef.current) mainVideoRef.current.srcObject = disp;
      mainVideoRef.current.play().catch(() => {});
      setIsSharing(true);

      disp.getVideoTracks()[0].onended = async () => {
        await startLocalStream();
        setIsSharing(false);
      };
    } catch (err) {
      console.warn('Screen share failed', err);
    }
  } else {
    await startLocalStream();
    setIsSharing(false);
  }

};

  const leaveMeeting = () => {
    socket.emit('leave-meeting', { meetingId, userId: socket.id });
    Object.values(peersRef.current).forEach(p => p.destroy && p.destroy());
    peersRef.current = {};
    setPeers({});
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setView('select');
    setMeetingId('');
  };

  // chat
  const sendMessage = (text, file) => {
    const msg = { id: Date.now(), from: user?.id || 'me', text, fileName: file?.name, ts: new Date().toISOString() };
    setMessages(m => [...m, msg]);
    socket && socket.emit && socket.emit('chat-message', { meetingId, msg });
  };

  const handleFileAttach = (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    sendMessage('', f);
  };

  // --- UI components ---

  // Refactored ButtonLarge for Selector/Lobby
  function ButtonLarge({ icon, text, onClick, color = DARK_THEME.accent }) {
    return (
      <motion.button
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition text-white shadow-md flex-1"
        style={{ background: color, minWidth: 110, fontSize: 16 }}
        onClick={onClick}
      >
        {icon} {text}
      </motion.button>
    );
  }

  // Refactored IconRoundBtn for Meeting Controls (Dark theme)
  function MeetingControlBtn({ icon, onClick, active, isDanger = false, label }) {
    const bgColor = isDanger ? DARK_THEME.danger : active ? DARK_THEME.accent : DARK_THEME.surface;
    const hoverBgColor = isDanger ? '#e03a30' : active ? '#72aaff' : '#3c4043';
    const textColor = isDanger ? DARK_THEME.text : DARK_THEME.text;

    return (
      <motion.button
        className={`rounded-full p-3 shadow-lg transition flex items-center justify-center`}
        whileTap={{ scale: 0.9 }}
        title={label}
        style={{ backgroundColor: bgColor, color: textColor }}
        onClick={onClick}
      >
        {icon}
      </motion.button>
    );
  }

  function WorkspaceSelector() {
    const currentWorkspaceName = workspaces.find(w => w.id === selectedWorkspace)?.name || 'Select Workspace';
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-20">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-t-8" style={{ borderColor: COLORS.purple, background: "rgba(255,255,255,0.97)" }}>
          <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepest }}><Video className="inline mr-2" /> Start or Join a Meeting</h2>
          <p className="text-gray-500 mb-6">Choose your workspace to begin collaborating.</p>
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">CURRENT WORKSPACE: {currentWorkspaceName.toUpperCase()}</div>
            <select value={selectedWorkspace} onChange={e => { setSelectedWorkspace(e.target.value); setActiveWorkspaceId && setActiveWorkspaceId(e.target.value); }} className="py-3 px-4 border bg-gray-100 rounded-xl w-full text-lg focus:ring-purple-500 focus:border-purple-500">
              <option value="">-- Select or Change Workspace --</option>
              {workspaces && workspaces.map((w, i) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <div className="flex gap-4 pt-4">
              <ButtonLarge icon={<Video />} text="Create Meeting" onClick={() => createMeeting()} color={COLORS.purple} />
              <ButtonLarge icon={<Calendar />} text="Schedule" onClick={() => setView('schedule')} color={COLORS.blue} />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t mt-4">
              <input placeholder="Enter meeting ID" value={meetingId} onChange={e => setMeetingId(e.target.value)} className="flex-1 py-3 px-4 border rounded-xl bg-gray-50 text-lg" />
              <ButtonLarge icon={<Link />} text="Join" onClick={() => handleJoinMeeting({ id: meetingId })} color={COLORS.deepest} />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  function Lobby() {
    // Reusing the original lobby structure as it's a good pre-meeting area
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-5xl mx-auto flex flex-col gap-7">
        {/* ... (Lobby content remains mostly the same, using original styling) ... */}
        <div className="flex justify-between flex-col sm:flex-row gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: COLORS.purple }}>Meeting Lobby</h3>
            <div className="text-gray-600 text-base">Meeting <b>ID</b>: <span style={{ color: COLORS.deepest }}>{meetingId}</span> {meetingPass ? <>&nbsp;| Pass: ****</> : null}</div>
          </div>
          <div className="flex gap-2">
            <ButtonLarge icon={<Video />} text="Start meeting" onClick={handleStartMeeting} color={COLORS.blue} />
            <ButtonLarge icon={<PhoneOff />} text="Cancel" onClick={() => setView('select')} color="#e95252" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-7 mt-2 bg-transparent">
          <CardPanel>
            <div className="flex flex-col items-center justify-center gap-5 h-full">
              <div className="rounded-xl  w-full max-w-xs aspect-video flex items-center justify-center shadow-md border-4 border-pink-400/70 overflow-hidden">
                <video ref={myVideo} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-4">
                <MeetingControlBtn onClick={toggleMic} active={micOn} icon={micOn ? <Mic /> : <MicOff />} label={micOn ? "Mic on" : "Mic off"} />
                <MeetingControlBtn onClick={toggleCam} active={camOn} icon={camOn ? <Video /> : <VideoOff />} label={camOn ? "Cam on" : "Cam off"} />
                <MeetingControlBtn onClick={toggleScreenShare} active={isSharing} icon={<Share2 />} label="Share" />
              </div>
              <div className="text-xs text-gray-400 mt-2 text-center">You are currently in the lobby. Your mic and camera are on/off as shown.</div>
            </div>
          </CardPanel>
          <CardPanel>
            <div className="flex flex-col gap-2">
              <div className="text-base font-semibold pb-1 flex items-center gap-2"><Link className="inline" /> Invite others</div>
              <input className="p-2 border rounded bg-gray-100 mb-2" value={`${window.location.origin}/join/${meetingId || '---'}`} readOnly />
              <button className="py-2 px-5 rounded-xl text-white bg-gradient-to-r from-pink-500 to-blue-500 font-medium hover:scale-105 transition" onClick={() => 
              {
                navigator.clipboard.writeText(`${window.location.origin}/join/${meetingId}`);
            toast("Meeting link copied!"); 
              }}>Copy link</button>
              
              
            </div>
          </CardPanel>
          <CardPanel>
            <div>
              <div className="font-semibold text-base mb-1 flex items-center"><Users className="inline mr-2" />Participants</div>
              <div className="flex flex-col gap-2 mt-2">
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: getColor(1) }}></span> {user?.name || "You"} <span className="ml-2 px-2 bg-purple-100 text-purple-800 rounded-xl">Host</span></span>
                {/* Map others */}
              </div>
            </div>
          </CardPanel>
        </div>
      </motion.div>
    );
  }

  function Meeting() {
    const peerList = Object.keys(peers);
    const mainParticipantLabel = isSharing ? (user?.name || 'You') + ' is presenting' : (user?.name || 'You');

    if (!selectedWorkspace) {
      // FIXED: Prevent showing meeting UI if no workspace selected; fallback to selector
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-20 text-center text-white">
          <div style={{ padding: 40, background: DARK_THEME.surface, borderRadius: 16 }}>
            <p>Please select a workspace before joining a meeting.</p>
            <button
              onClick={() => setView('select')}
              style={{ marginTop: 20, padding: '10px 20px', backgroundColor: DARK_THEME.accent, borderRadius: 8, color: DARK_THEME.text }}
            >
              Go to Workspace Selector
            </button>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-screen overflow-hidden" style={{ background: DARK_THEME.bg }}>
        {/* Header Bar */}
        <div className="flex items-center p-3" style={{ background: DARK_THEME.header, color: DARK_THEME.text }}>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-semibold">{mainParticipantLabel}</span>
            <span className="text-xs ml-3 py-1 px-2 rounded-xl" style={{ backgroundColor: DARK_THEME.accent, opacity: isSharing ? 1 : 0.6 }}>
                {isSharing ? 'is presenting' : 'Class Meeting'}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden p-4 pb-0">
          {/* Large Video / Screen Share */}
          <div className="flex-1 rounded-xl overflow-hidden mr-4 shadow-2xl relative" style={{ background: '#303030' }}>
            <ParticipantVideo key={localStream ? localStream.id :'none'} refObj={mainVideoRef} label={isSharing ? mainParticipantLabel : (user?.name || 'You')} isLocal isMain />
            <div className="absolute bottom-2 left-3 text-lg font-semibold text-white">
                {isSharing ? 'Fathima is presenting' : 'Fathima'} {/* Hardcoding for UI match */}
            </div>
          </div>
          
          {/* Small Participant Grid (Right Side) */}
          <div className="w-64 space-y-3 overflow-y-auto">
            {/* Hardcode a few tiles to match the image UI exactly */}
            <SmallVideoTile name="Janella Yuen" isSpeaking={false} />
            <SmallVideoTile name="Joe Carson" isSpeaking={false} />
            <SmallVideoTile name="Lucy Sera" isSpeaking={false} />
            <SmallVideoTile name="Sitta Johns" isSpeaking={false} />
            <SmallVideoTile name="Leonard David" isSpeaking={true} />
            <SmallVideoTile name="Rachal Green" isSpeaking={false} />
            <SmallVideoTile name="Carol Smith" isSpeaking={false} />
            <SmallVideoTile name="Monica Geller" isSpeaking={false} />
            {/* Map actual remote peers */}
            {peerList.map((id, idx) => (
              <VideoTile key={id} peer={peers[id].peer} label={peers[id].name} color={getColor(idx+2)} isSmall />
            ))}
          </div>
        </div>

        {/* Control Bar (Bottom) */}
        <div className="flex items-center justify-between px-6 py-3" style={{ background: DARK_THEME.bg, borderTop: `1px solid ${DARK_THEME.surface}` }}>
          {/* Left: Meeting Info */}
          <div className="text-white text-sm font-medium">Class meeting</div>

          {/* Center: Controls */}
          <div className="flex items-center gap-3">
            <MeetingControlBtn onClick={toggleMic} active={micOn} icon={micOn ? <Mic size={22} /> : <MicOff size={22} />} label="Toggle Mic" />
            <MeetingControlBtn onClick={toggleCam} active={camOn} icon={camOn ? <Video size={22} /> : <VideoOff size={22} />} label="Toggle Camera" />
            <MeetingControlBtn onClick={toggleScreenShare} active={isSharing} icon={<Share2 size={22} />} label="Share Screen" />
            <MeetingControlBtn onClick={() => setChatOpen(v => !v)} active={chatOpen} icon={<MessageCircle size={22} />} label="Toggle Chat" />
            <MeetingControlBtn onClick={() => { /* stub */ }} active={false} icon={<Users size={22} />} label="Participants" />
            <MeetingControlBtn onClick={() => { /* stub */ }} active={false} icon={<MoreVertical size={22} />} label="More Options" />
            
            {/* Hang Up Button (Danger) */}
            <MeetingControlBtn onClick={leaveMeeting} isDanger={true} icon={<PhoneOff size={24} />} label="Leave Meeting" />
          </div>

          
        </div>

        {/* Chat Sidebar (Kept separate for simplicity, not fully styled for dark theme here) */}
        {chatOpen && (
              <motion.aside 
                initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} 
                transition={{ type: 'spring', stiffness: 200 }} 
                className="w-96 border-l bg-white shadow-lg flex flex-col fixed right-0 top-0 bottom-0 z-50"
              >
                <div className="p-3 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2 text-gray-800"><MessageCircle /> <span className="font-semibold">Chat</span></div>
                  <button onClick={() => setChatOpen(false)} className="text-sm text-gray-800 rounded hover:bg-gray-100 px-2">Hide</button>
                </div>
                <div className="flex-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                  {messages.map(m => (
                    <div key={m.id} className={`mb-3 ${m.from === user?.id ? 'text-right' : 'text-left'}`}>
                      <motion.div layout className="inline-block bg-gray-100 p-2 rounded-xl max-w-xs">
                        {m.fileName ? <div className="text-sm text-blue-600">📎 {m.fileName}</div> : null}
                        {m.text}
                        <div className="text-xs text-gray-400 mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
                      </motion.div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <input placeholder="Write a message" id="chat-input" className="flex-1 p-2 border rounded-xl" onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage(e.target.value); e.target.value=''; } }} />
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileAttach} />
                    <button onClick={() => fileInputRef.current.click()} className="p-2 rounded bg-gray-50 hover:bg-gray-200 transition"><Paperclip size={18} /></button>
                    <button onClick={() => sendMessage('👍')} className="p-2 rounded bg-gray-50 hover:bg-gray-200 transition"><Smile size={18} /></button>
                  </div>
                </div>
              </motion.aside>
            )}
      </motion.div>
    );
  }

  // Generic big card panel (for Lobby)
  function CardPanel({ children }) {
    return <div className="p-5 bg-white rounded-2xl shadow-2xl border border-gray-200">{children}</div>;
  }

  function ParticipantVideo({ refObj, label, isLocal, isMain = false }) {
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    if (refObj.current && refObj.current.srcObject) {
      setHasStream(true);
      refObj.current.play().catch(() => {});
    } else {
      setHasStream(false);
    }
  }, [refObj?.current?.srcObject]);

  return (
    <div className={`relative ${isMain ? 'h-full' : 'h-full w-full'}`} style={{ background: '#303030' }}>
      <video ref={refObj} autoPlay muted={isLocal} playsInline className="w-full h-full object-cover transition" />
      {!hasStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white text-xl">
          {label?.charAt(0)}
        </div>
      )}
    </div>
  );
}
  
  // Dedicated component for the small video tiles on the right
  function SmallVideoTile({ name, isSpeaking = false }) {
      const borderColor = isSpeaking ? DARK_THEME.accent : 'transparent';

      // This component is mostly for UI mimicry of the image
      // Real peer data will use VideoTile below
      return (
          <div className="relative aspect-video rounded-lg overflow-hidden flex items-center justify-center bg-gray-700 shadow-md"
               style={{ border: `3px solid ${borderColor}` }}>
              {/* Image/Avatar Placeholder */}
              <img 
                  src={`/placeholder-avatar-${name.split(' ')[0].toLowerCase()}.jpg`} 
                  alt={name} 
                  className="w-full h-full object-cover" 
                  style={{objectFit: 'cover'}}
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.backgroundColor = '#4a4a4a'; }} // Fallback
              />
              <div className="absolute bottom-1 left-2 bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">{name}</div>
          </div>
      );
  }

  // VideoTile for remote peers in the main grid
  function VideoTile({ peer, label, color, isSmall = false }) {
    const ref = useRef();
    useEffect(() => {
      if (!peer) return;
      const handleStream = (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
        ref.current.play().catch(() => {});
      }
    };
    peer.on('stream', handleStream);
      return () => {
        try { peer.removeAllListeners && peer.removeAllListeners('stream'); } catch (e) {}
      };
    }, [peer]);

    const styleClasses = isSmall 
        ? "aspect-video rounded-lg overflow-hidden shadow-md" 
        : "aspect-video rounded-xl overflow-hidden shadow-lg";

    return (
      <div className={`relative flex items-center justify-center ${styleClasses}`} style={{ background: '#303030', border: `3px solid ${color}` }}>
        <video ref={ref} autoPlay playsInline muted={false} className="w-full h-full object-cover transition" />
        <div className="absolute bottom-1 left-2  bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">{label}</div>
      </div>
    );
  }

  // --- Main renderer ---
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="min-h-screen" style={{ background: bgGradient }}>
        <div className="max-w-screen-2xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'select' && <WorkspaceSelector key="select" />}
            {view === 'lobby' && <Lobby key="lobby" />}
            {view === 'meeting' && <Meeting key="meeting" />}
            {view === 'schedule' && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-xl mt-20">
                <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.blue }}>Schedule meeting</h3>
                <div className="flex gap-2">
                  <input type="datetime-local" className="p-3 border rounded-xl flex-1" />
                  <ButtonLarge text="Schedule" color={COLORS.purple} onClick={() => scheduleMeeting(new Date().toISOString())} />
                  <ButtonLarge text="Cancel" color="#d6d6d6" onClick={() => setView('select')} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}