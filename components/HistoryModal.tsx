import React from 'react';
import { WorkoutSession } from '../types';

interface HistoryModalProps {
    history: WorkoutSession[];
    onClose: () => void;
    onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClear }) => {
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} phút ${secs} giây`;
    };

    const handleClear = () => {
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử tập luyện?')) {
            onClear();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md text-white shadow-2xl flex flex-col" style={{maxHeight: '80vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Lịch sử tập luyện</h2>
                    <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {history.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">Chưa có buổi tập nào được ghi lại.</p>
                    ) : (
                        history.map((session, index) => (
                            <div key={index} className="bg-slate-700 p-4 rounded-lg">
                                <p className="font-semibold text-lg">{new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-slate-300">Thời gian: <span className="font-medium text-white">{formatDuration(session.duration)}</span></p>
                                <p className="text-slate-300">Số hiệp: <span className="font-medium text-white">{session.roundsCompleted}</span></p>
                                <p className="text-slate-300 text-sm mt-1">Cài đặt: {session.settings.workTime}s tập / {session.settings.restTime}s nghỉ</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 flex space-x-4">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">
                        Đóng
                    </button>
                    {history.length > 0 &&
                        <button onClick={handleClear} className="w-full py-2 px-4 bg-red-800 hover:bg-red-700 text-white rounded-md font-semibold transition-colors">
                            Xóa lịch sử
                        </button>
                    }
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
