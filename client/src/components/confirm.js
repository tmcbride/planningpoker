import React from 'react';

export function Dialog({open, message, onConfirm, onCancel}) {
    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{message}</p>
                <div className="modal-actions">
                    {onConfirm ? (
                        <div>
                            <button className="modal-btn" onClick={onConfirm}>Yes</button>
                            <button className="modal-btn" onClick={onCancel}>No</button>
                        </div>
                    ) : (
                        <button className="modal-btn" onClick={onCancel}>OK</button>
                    )}
                </div>
            </div>
        </div>
    );
}