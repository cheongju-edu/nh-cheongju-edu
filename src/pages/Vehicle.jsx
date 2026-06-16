import React, { useState } from 'react';
import { Car, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useSettings } from '../context/SettingsContext';
import Loading from '../components/Loading';

const Vehicle = () => {
    const { settings, loading } = useSettings();
    const [formData, setFormData] = useState({
        car_number: '',
        user_name: '',
        visit_start_date: '',
        visit_end_date: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [password, setPassword] = useState('');

    if (loading) return <Loading />;

    const handleCarNumberChange = (e) => {
        const value = e.target.value;
        if (/\s/.test(value)) {
            alert('차량번호에는 공백을 입력할 수 없습니다.');
        }
        setFormData({ ...formData, car_number: value.replace(/\s/g, '') });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.car_number || !formData.user_name || !formData.visit_start_date || !formData.visit_end_date) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        if (/\s/.test(formData.car_number)) {
            alert('차량번호에는 공백을 입력할 수 없습니다.');
            return;
        }

        if (formData.visit_start_date > formData.visit_end_date) {
            alert('교육종료일은 교육시작일보다 빠를 수 없습니다.');
            return;
        }

        try {
            setSubmitting(true);
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('vehicle_registrations')
                .insert([{
                    car_number: formData.car_number,
                    user_name: formData.user_name,
                    visit_start_date: formData.visit_start_date,
                    visit_end_date: formData.visit_end_date
                }]);

            if (error) throw error;

            setSubmitted(true);
            setFormData({ car_number: '', user_name: '', visit_start_date: '', visit_end_date: '' });
        } catch (error) {
            console.error('Error registering vehicle:', error);
            alert(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdminLogin = () => {
        const opPassword = settings?.operation_password || '1234';
        if (password === opPassword) {
            setIsAdmin(true);
            setShowAdminLogin(false);
            setPassword('');
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    };

    const handleReset = async () => {
        if (!window.confirm('정말로 모든 차량등록 데이터를 초기화하시겠습니까?')) return;
        try {
            const { error } = await supabase
                .from('vehicle_registrations')
                .delete()
                .neq('id', 0);
            if (error) throw error;
            alert('초기화되었습니다.');
        } catch (error) {
            console.error('Error resetting data:', error);
            alert(`초기화 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">차량등록</h2>
                <button
                    onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(!showAdminLogin)}
                    className={`p-2 rounded-full ${isAdmin ? 'bg-nh-blue text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <Lock size={20} />
                </button>
            </div>

            {showAdminLogin && !isAdmin && (
                <div className="bg-gray-100 p-4 rounded-lg flex gap-2">
                    <input
                        type="password"
                        placeholder="관리자 비밀번호"
                        className="flex-1 p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        onClick={handleAdminLogin}
                        className="bg-nh-blue text-white px-4 py-2 rounded font-bold"
                    >
                        확인
                    </button>
                </div>
            )}

            {isAdmin && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-red-700">관리자 기능</span>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm"
                    >
                        <RefreshCw size={16} />
                        데이터 초기화
                    </button>
                </div>
            )}

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Car size={20} className="text-amber-500" />
                    차량등록
                </h3>

                {submitted ? (
                    <div className="text-center py-8 space-y-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <p className="font-bold text-gray-800">차량등록이 완료되었습니다.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-sm text-nh-blue underline"
                        >
                            추가 등록하기
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">차량번호</label>
                            <input
                                type="text"
                                value={formData.car_number}
                                onChange={handleCarNumberChange}
                                className="w-full p-2 border border-gray-200 rounded focus:border-nh-blue focus:ring-1 focus:ring-nh-blue outline-none transition-colors"
                                placeholder="예: 12가3456 (공백 없이)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">성명</label>
                            <input
                                type="text"
                                value={formData.user_name}
                                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded focus:border-nh-blue focus:ring-1 focus:ring-nh-blue outline-none transition-colors"
                                placeholder="홍길동"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">교육시작일</label>
                                <input
                                    type="date"
                                    value={formData.visit_start_date}
                                    onChange={(e) => setFormData({ ...formData, visit_start_date: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-nh-blue focus:ring-1 focus:ring-nh-blue outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">교육종료일</label>
                                <input
                                    type="date"
                                    value={formData.visit_end_date}
                                    onChange={(e) => setFormData({ ...formData, visit_end_date: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-nh-blue focus:ring-1 focus:ring-nh-blue outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-colors shadow-sm active:scale-[0.98] ${
                                submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
                            }`}
                        >
                            {submitting ? '등록 중...' : '차량 등록하기'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Vehicle;
