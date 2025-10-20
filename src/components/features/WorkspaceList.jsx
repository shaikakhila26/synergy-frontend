import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FaPlus, FaUsers, FaUserShield, FaSearch, FaClipboardCheck, FaLink } from "react-icons/fa";
import { supabase } from "../../supabaseClient";
import { ToastContainer , toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const addToast = (msg) => toast.info(msg, {
  position: "top-center",
  autoClose: 2500,    
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
});
// Color palette
const COLORS = {
  pink: "#F5D5E0",
  blue: "#6667AB",
  purple: "#7B337E",
  darkPurple: "#420D4B",
  deepest: "#210635",
  accent: "#A73AEC"
};

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(40px) scale(.97);}
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const CardPop = keyframes`
  0% { transform: scale(.91);}
  90% { transform: scale(1.06);}
  100% { transform: scale(1);}
`;

const Container = styled.div`
  animation: ${fadeInUp} 0.7s .09s cubic-bezier(.28,.84,.42,1.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
`;

const Welcome = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${COLORS.purple};
  display: flex;
  align-items: center;
  gap: 0.7rem;
  span {
    color: ${COLORS.blue};
    font-size: 1.2rem;
    font-weight: 400;
    margin-left: .8rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1.1rem;
`;

const Button = styled.button`
  background: linear-gradient(96deg, ${COLORS.purple}, ${COLORS.blue} 86%);
  color: ${COLORS.pink};
  border: none;
  border-radius: 1.1rem;
  font-size: 1.09rem;
  font-weight: 600;
  padding: .81rem 2.1rem;
  box-shadow: 0 8px 24px ${COLORS.purple}18;
  cursor: pointer;
  margin-left: 0.8rem;
  transition: box-shadow 0.17s, background 0.17s;
  &:hover {
    background: linear-gradient(96deg, ${COLORS.blue}, ${COLORS.accent} 88%);
    box-shadow: 0 0px 38px ${COLORS.accent}62;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SearchBar = styled.div`
  display: flex;
  background: ${COLORS.deepest};
  border-radius: 1.2rem;
  align-items: center;
  padding: 0.6rem 1.1rem;
  margin-top: 1.7rem;
  margin-bottom: 1.7rem;
  box-shadow: 0 4px 22px ${COLORS.accent}06;
  max-width: 480px;
  width: 100%;
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: ${COLORS.pink};
  font-size: 1.07rem;
  margin-left: 0.6rem;
  outline: none;
  width: 100%;
`;

const WorkspaceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1.7rem;
`;

const Card = styled.div`
  background: ${COLORS.deepest};
  border-radius: 1.25rem;
  min-height: 167px;
  box-shadow: 0 7px 38px ${COLORS.purple}22, 0 2px 8px ${COLORS.deepest}11;
  padding: 1.7rem 1.2rem 1.4rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  animation: ${CardPop} 0.55s cubic-bezier(.26,.84,.42,1.05);
  position: relative;
  transition: transform 0.16s, box-shadow 0.16s;
  &:hover {
    transform: translateY(-5px) scale(1.035) perspective(642px) rotateY(1.5deg);
    box-shadow: 0 16px 64px ${COLORS.accent}66, 0 2px 8px ${COLORS.deepest}13;
    border: 1.4px solid ${COLORS.accent}54;
  }
`;

const CardHeader = styled.div`
  font-weight: 800;
  color: ${COLORS.pink};
  font-size: 1.35rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const CardMembers = styled.div`
  color: ${COLORS.blue};
  font-size: .97rem;
  margin-top: 0.7rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InviteButton = styled(Button)`
  margin: 0;
  font-size: .99rem;
  border-radius: 2rem;
  padding: 0.53rem 1.8rem;
  min-width: 128px;
`;

const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(33,6,53,0.82); z-index: 2020; display: flex; align-items: center; justify-content: center;
  animation: ${fadeInUp} 0.41s cubic-bezier(.28,.84,.42,1.05);
`;

const Modal = styled.div`
  background: ${COLORS.darkPurple};
  border-radius: 1.35rem;
  padding: 2.2rem 2.5rem 2rem 2.1rem;
  min-width: 370px;
  color: #fff;
`;

const ModalTitle = styled.h2`
  color: ${COLORS.pink}; font-weight: 700; font-size: 1.55rem; margin-bottom: 1.2rem;
`;

const ModalRow = styled.div`margin-bottom: 1.2rem;`;

const ModalActions = styled.div`text-align: right;`;

const ErrorMsg = styled.div`
  color: #ff2e69; font-size: .97rem; margin-top: 0.7rem; min-height: 20px;
`;

export default function WorkspaceList() {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { openWorkspace } = useWorkspace(); 
  const [inviteModal, setInviteModal] = useState(null); // workspaceId currently inviting
const [inviteEmail, setInviteEmail] = useState("");
const [inviteLoading, setInviteLoading] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return window.location.href = "/login";
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!user || error) return window.location.href = "/login";
        setUser(user);
      } catch {
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) getWorkspaces();
  }, [user]);

  useEffect(() => {
    if (!search) setSearchResults([]);
  }, [search]);

  async function getWorkspaces() {
    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(name, id, invite_code)")
        .eq("user_id", user.id);
        if (error || !data) return setWorkspaces([]);

    const normalized = data.map(x => x.workspaces).filter(Boolean);
      setWorkspaces(normalized);
    } catch {
      setWorkspaces([]);
    }
  }

  async function handleCreateWorkspace() {
    setError("");
    if (!modalData.name || !user) {
      setError("Workspace name is required.");
      return;
    }
    setLoading(true);
    try {

      // 1️⃣ Get the current session to retrieve access_token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("You must be logged in.");
      return;
    }
      const res = await fetch(`${BACKEND_URL}/api/workspace/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
          // 2️⃣ Add the token here
        'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: modalData.name,
          owner_id: user.id,
          is_public: !!modalData.public
        })
      });
      const out = await res.json();
      if(res.ok){
        setModal(null);
        setModalData({});
        getWorkspaces();
      } else setError(out.message || "Failed to create workspace.");
    } catch (err) {
      setError(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinWorkspace() {
    setError("");
    if (!modalData.invitecode || !user) {
      setError("Invite code is required.");
      return;
    }
    setLoading(true);
    try {

      const { data: { session } } = await supabase.auth.getSession();
      if(!session?.access_token) return setError("No session token found.");

      const res = await fetch(`${BACKEND_URL}/api/workspace/join`, {
        method: 'POST',
        headers: {'Content-Type':'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          invite_code: modalData.invitecode,
          user_id: user.id
        })
      });
      const out = await res.json();
      if(res.ok){
        setModal(null);
        setModalData({});
        getWorkspaces();
      } else setError(out.message || "Failed to join workspace.");
    } catch (err) {
      setError(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(value) {
    const query = value.trim();
    if(!query) return setSearchResults([]);
    try {
      const res = await fetch(`${BACKEND_URL}/api/workspace/search?q=${encodeURIComponent(query)}`);
      const result = await res.json();
      // Ensure searchResults is always an array, filter out invalid entries
    const normalized = Array.isArray(result.data?.workspaces) ? result.data.workspaces.filter(Boolean) : [];
    setSearchResults(normalized);
    } catch {
      setSearchResults([]);
    }
  }

  async function handleSendInvite(workspaceId) {
  if (!inviteEmail) return setError("Email is required");
  setInviteLoading(true);
  setError("");
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Inviting workspace:", inviteModal);

    const res = await fetch(`${BACKEND_URL}/api/workspace/${workspaceId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ email: inviteEmail })
    });
    const out = await res.json();
    if (res.ok) {
      addToast(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteModal(null);
    } else setError(out.message || "Failed to send invite");
  } catch (err) {
    setError(err.message || "Network error");
  } finally {
    setInviteLoading(false);
  }
}

  const cardStyle = {
    boxShadow: "0 14px 38px #A73AEC32, 0 2px 4px #21063577",
    transform: "perspective(770px) rotateY(-1deg)",
    transition: "0.18s cubic-bezier(.35,.9,.45,1.25)"
  };

  if(!user) return <div>Loading...</div>;

  return (
    <Container>
      <ToastContainer />
      <Header>
        <Welcome>
          <FaClipboardCheck style={{fontSize:"2.1rem", color:COLORS.accent, filter: "drop-shadow(0 1px 12px #A73AEC99)"}} />
          Workspaces
          
        </Welcome>
        <Controls>
          <Button onClick={() => { setModal("create"); setModalData({}); }}>
            <FaPlus style={{marginRight:8}}/> New
          </Button>
          <Button onClick={() => { setModal("join"); setModalData({}); }}>
            <FaUsers style={{marginRight:8}}/> Join
          </Button>
        </Controls>
      </Header>

      <SearchBar>
        <FaSearch style={{color: COLORS.pink}} />
        <Input 
          placeholder="Search public workspaces..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => 
          {
           if (e.key === 'Enter') handleSearch(e.target.value);
           else setSearchResults([]);
          }}
        />
      </SearchBar>

      {search && (
        <WorkspaceGrid style={{marginBottom:"2.2rem"}}>
          {searchResults.map(ws => (
            <Card key={ws.id } style={cardStyle} onClick={() => openWorkspace(ws.id)}>
              <CardHeader>
                <FaUserShield style={{marginRight:8, fontSize:'1.27rem', color:COLORS.accent}}/>
                {ws.name || "Unnamed Workspace"}
              </CardHeader>
              <InviteButton onClick={() => {
                setModalData({ ...modalData, invitecode: ws.invite_code });
                setModal("join");
            }}>
                Join
              </InviteButton>
            </Card>
          ))}
        </WorkspaceGrid>
      )}
      {search && searchResults.length === 0 && (
  <div style={{color: COLORS.pink, marginTop:"1rem"}}>No workspaces found</div>
)}


      <WorkspaceGrid>
        {workspaces.map(ws => (
          <Card key={ws.id} style={cardStyle}>
            <CardHeader>
              <FaClipboardCheck style={{marginRight:8, fontSize:'1.17rem', color: COLORS.purple}} />
              {ws.name}
            </CardHeader>
            <CardMembers>
              <FaUsers />
            </CardMembers>
            <InviteButton onClick={() => setInviteModal(ws.id)}>
  <FaUsers style={{marginRight:4}}/> Invite
</InviteButton>


          </Card>
        ))}
      </WorkspaceGrid>

      {modal && (
        <ModalBackdrop onClick={()=>setModal(null)}>
          <Modal onClick={e=>e.stopPropagation()}>
            {modal==="create" ? (
              <>
                <ModalTitle><FaPlus style={{marginRight:9}}/>Start New Workspace</ModalTitle>
                <ModalRow>
                  <Input placeholder="Workspace Name" 
                         value={modalData.name||''}
                         onChange={e=>setModalData({...modalData, name: e.target.value})}/>
                </ModalRow>
                <ModalRow>
                  <label>
                    <input 
                      type="checkbox"
                      checked={!!modalData.public}
                      onChange={e=>setModalData({...modalData, public: e.target.checked})}
                    /> Publicly searchable
                  </label>
                </ModalRow>
                <ErrorMsg>{error}</ErrorMsg>
                <ModalActions>
                  <Button onClick={handleCreateWorkspace} disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                  </Button>
                </ModalActions>
              </>
            ) : (
              <>
                <ModalTitle><FaUsers style={{marginRight:9}}/>Join by Invite Code</ModalTitle>
                <ModalRow>
                  <Input 
                    placeholder="Paste an invite code…" 
                    value={modalData.invitecode||''}
                    onChange={e=>setModalData({...modalData, invitecode: e.target.value})}/>
                </ModalRow>
                <ErrorMsg>{error}</ErrorMsg>
                <ModalActions>
                  <Button onClick={handleJoinWorkspace} disabled={loading}>
                    {loading ? "Joining..." : "Join"}
                  </Button>
                </ModalActions>
              </>
            )}
          </Modal>
        </ModalBackdrop>
      )}
      {inviteModal && (
  <ModalBackdrop onClick={() => setInviteModal(null)}>
    <Modal onClick={e => e.stopPropagation()}>
      <ModalTitle>Send Workspace Invite</ModalTitle>
      <ModalRow>
        <Input
          placeholder="Enter user email..."
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
        />
      </ModalRow>
      <ErrorMsg>{error}</ErrorMsg>
      <ModalActions>
        <Button
          onClick={() => handleSendInvite(inviteModal)}
          disabled={inviteLoading}
        >
          {inviteLoading ? "Sending..." : "Send Invite"}
        </Button>
      </ModalActions>
    </Modal>
  </ModalBackdrop>
)}


    </Container>
  );
}
