import React from "react";
import {useOutletContext} from "react-router";
import {CheckCircle2Icon, CloudUploadIcon, ImageIcon} from "lucide-react"
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS, MAX_FILE_SIZE } from "../../lib/constants";

type UploadProps = {
  onComplete?: (base64?: string) => void;
};

const Upload: React.FC<UploadProps> = ({ onComplete }) =>{
    const [file, setFile] = React.useState<File | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const {isSignedIn} = useOutletContext<AuthContext>();

    const intervalIdRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, []);

    const processFile = React.useCallback((fileToProcess: File) => {
        if (!isSignedIn) return;

        // Validate file type and size
        const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'/*, '.webp'*/];
        const lcName = fileToProcess.name.toLowerCase();
        const hasAllowedExt = allowedExt.some(ext => lcName.endsWith(ext));
        const isImageType = fileToProcess.type ? fileToProcess.type.startsWith('image/') : false;

        if (!hasAllowedExt && !isImageType) {
            console.warn('Unsupported file type:', fileToProcess.type, fileToProcess.name);
            return;
        }

        if (fileToProcess.size > MAX_FILE_SIZE) {
            console.warn('File too large:', fileToProcess.size);
            return;
        }

        setFile(fileToProcess);

        const reader = new FileReader();

        reader.onload = () => {
            const base64 = String(reader.result ?? "");
            setProgress(0);

            // start interval and store id in ref so cleanup can access it
            intervalIdRef.current = window.setInterval(() => {
                setProgress(prev => {
                    const next = Math.min(100, prev + PROGRESS_STEP);
                    if (next >= 100) {
                        if (intervalIdRef.current !== null) {
                            clearInterval(intervalIdRef.current);
                            intervalIdRef.current = null;
                        }
                        setTimeout(() => {
                            onComplete?.(base64);
                        }, REDIRECT_DELAY_MS);
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };

        reader.onerror = () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            setProgress(0);
            onComplete?.(undefined);
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
                        accept=".jpg,.jpeg,.png,.gif,image/*"
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
                        <p className="help">Maximum file size {MAX_FILE_SIZE / (1024 * 1024)} MB.</p>
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