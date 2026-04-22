import React from "react";
import {useOutletContext} from "react-router";
import {CheckCircle2Icon, CloudUploadIcon, ImageIcon} from "lucide-react"
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from "../../lib/constants";

type UploadProps = {
  onComplete?: (base64: string) => void;
};

const Upload: React.FC<UploadProps> = ({ onComplete }) =>{
    const [file, setFile] = React.useState<File | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const {isSignedIn} = useOutletContext<AuthContext>();

    const processFile = React.useCallback((fileToProcess: File) => {
        if (!isSignedIn) return;
        setFile(fileToProcess);

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = String(reader.result ?? "");
            setProgress(0);
            let intervalId = window.setInterval(() => {}, PROGRESS_INTERVAL_MS) as unknown as number;

            intervalId = window.setInterval(() => {
                setProgress(prev => {
                    const next = Math.min(100, prev + PROGRESS_STEP);
                    if (next >= 100) {
                        clearInterval(intervalId);
                        setTimeout(() => {
                            onComplete?.(base64);
                        }, REDIRECT_DELAY_MS);
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS) as unknown as number;
        };
        reader.readAsDataURL(fileToProcess);
    }, [isSignedIn, onComplete]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!isSignedIn) return;
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            processFile(dt.files[0]);
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const f = e.target.files?.[0];
        if (f) processFile(f);
    }

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jper,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <CloudUploadIcon size={20} />
                        </div>
                        <p>{
                            isSignedIn ? "Click to select file to upload or drag and drop it here"
                                :"Click to upload"
                        }</p>
                        <p className="help">Maximum file size 50 MB.</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {
                                progress == 100 ? (
                                    <CheckCircle2Icon className="check"/>
                                ) : (
                                    <ImageIcon className="image" />
                                )
                            }
                        </div>
                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{width:`${progress}%`}} />
                            <p className="status-text">{progress < 100 ? "Analyzing Floor Plan ..." : "Redirecting ..."}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upload