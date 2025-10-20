import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../AuthProvider";
import { FileText, Trash2, Link as LinkIcon, UploadCloud, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function FileManager() {
  const { user } = useAuth();
  const { workspaces } = useWorkspace();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Set default workspace on mount
  useEffect(() => {
    if (workspaces.length > 0) setSelectedWorkspaceId(workspaces[0].id);
  }, [workspaces]);

  // Load files for selected workspace
  useEffect(() => {
    if (!selectedWorkspaceId) return;

    let mounted = true;
    const loadFiles = async () => {
      try {
        const { data: fileRows, error } = await supabase
          .from("files")
          .select("*")
          .eq("workspace_id", selectedWorkspaceId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted) setFiles(fileRows || []);
      } catch (err) {
        console.error("Error loading files:", err);
      }
    };

    loadFiles();
    return () => { mounted = false; };
  }, [selectedWorkspaceId]);

  // Upload file
  const handleUpload = async e => {
    const file = e.target.files?.[0];
    if (!file || !selectedWorkspaceId || !user) return;
    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${selectedWorkspaceId}/${Date.now()}_${safeName}`;

    try {
      // 1️⃣ Upload file to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from("files")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw uploadErr;

      // 2️⃣ Get public URL
      const { publicUrl } = supabase.storage.from("files").getPublicUrl(path);

      // 3️⃣ Insert metadata into files table
      const { error: insertErr } = await supabase.from("files").insert({
        workspace_id: selectedWorkspaceId,
        name: file.name,
        path,
        url: publicUrl,
        size: file.size,
        mime: file.type,
        uploaded_by: user.id,
      });
      if (insertErr) throw insertErr;

      // 4️⃣ Add notification
      await supabase.from("notifications").insert({
        workspace_id: selectedWorkspaceId,
        actor_id: user.id,
        type: "file",
        title: `New file: ${file.name}`,
        body: `${file.name} uploaded.`,
        data: { path },
      });

      // 5️⃣ Update state
      setFiles(prev => [{ name: file.name, path, url: publicUrl, size: file.size, uploaded_by: user.id }, ...prev]);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed: " + err.message);

    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  // Delete file
  const removeFile = async path => {
    if (!confirm("Delete this file?")) return;
    try {
      const { error } = await supabase.from("files").delete().eq("path", path);
      if (error) throw error;

      setFiles(prev => prev.filter(f => f.path !== path));

      // add notification
      await supabase.from("notifications").insert({
        workspace_id: selectedWorkspaceId,
        actor_id: user.id,
        type: "file",
        title: `File deleted`,
        body: `${path} removed.`,
        data: { path },
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed: " + err.message);
    }
  };

  return (
    <motion.div 
      className="p-6 max-w-5xl mx-auto bg-white rounded-3xl shadow-xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
       <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Folder size={36} className="text-purple-600" />
          Workspace Files
        </h3>
        <div>
          <label htmlFor="upload-input" className={`inline-flex items-center gap-2 rounded-full bg-purple-600 text-white px-4 py-2 cursor-pointer shadow hover:bg-purple-700 transition`}>
            <UploadCloud size={20} />
            {uploading ? "Uploading..." : "Upload File"}
          </label>
          <input
            id="upload-input"
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      {/* Workspace selector */}
      <div className="mb-8">
        <label htmlFor="workspace-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Workspace
        </label>
        <select
          id="workspace-select"
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          value={selectedWorkspaceId}
          onChange={e => setSelectedWorkspaceId(e.target.value)}
        >
          <option value="">Select workspace...</option>
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <motion.div
          key="no-files"
          className="text-center py-20 text-gray-500 text-lg select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No files uploaded yet.
        </motion.div>
      ) : (
        <ul className="space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {files.map(f => (
              <motion.li
                key={f.path || f.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
                className="flex items-center justify-between p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileText size={30} className="text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-gray-900 truncate">{f.name}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {f.size ? `${Math.round(f.size / 1024)} KB` : f.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 flex-shrink-0">
                  {/* Open button */}
                  <button
                    onClick={async () => {
                      const { data, error } = await supabase.storage
                        .from("files")
                        .createSignedUrl(f.path, 60 * 60);
                      if (error) return toast.error("Cannot open file: " + error.message);

                      window.open(data.signedUrl, "_blank");
                    }}
                    title="Open file"
                    className="text-green-600 hover:text-green-800 transition flex items-center gap-1 font-semibold"
                  >
                    <FileText size={20} />
                    Open
                  </button>

                  {/* Share button */}
                  <button
                    onClick={async () => {
                      const { data, error } = await supabase.storage
                        .from("files")
                        .createSignedUrl(f.path, 60 * 60);

                      if (error) return toast.error("Cannot generate link: " + error.message);


                      const signedURL = data.signedUrl;
                      navigator.clipboard.writeText(signedURL);
                      toast.success("Shareable link copied to clipboard!");

                    }}
                    title="Copy shareable link"
                    className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 font-semibold"
                  >
                    <LinkIcon size={20} />
                    Share
                  </button>

                  {/* Delete button - only for uploader */}
                  {f.uploaded_by === user.id && (
                    <button
                      onClick={() => removeFile(f.path)}
                      title="Delete file"
                      className="text-red-600 hover:text-red-800 transition flex items-center gap-1 font-semibold"
                    >
                      <Trash2 size={20} />
                      Delete
                    </button>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
}
