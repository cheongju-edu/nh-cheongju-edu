import React, { useState } from 'react';
import { Car, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useSettings } from '../context/SettingsContext';
import Loading from '../components/Loading';

const Vehicle = () => {
    const { settings, loading } = useSettings();
    const [formData, setFormData] = useState({
        car_number: '',
        user_name: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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

        if (!formData.car_number || !formData.user_name) {
            alert('차량번호와 성명을 모두 입력해주세요.');
            return;
        }

        if (/\s/.test(formData.car_number)) {
            alert('차량번호에는 공백을 입력할 수 없습니다.');
            return;
        }

        try {
            setSubmitting(true);
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('vehicle_registrations')
                .insert([{
                    car_number: formData.car_number,
                    user_name: formData.user_name
                }]);

            if (error) throw error;

            setSubmitted(true);
            setFormData({ car_number: '', user_name: '' });
        } catch (error) {
            console.error('Error registering vehicle:', error);
            alert(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const visitPeriod = settings?.course_start_date && settings?.course_end_date
        ? `${settings.course_start_date} ~ ${settings.course_end_date}`
        : null;

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Car size={20} className="text-amber-500" />
                    차량등록
                </h3>

                {visitPeriod && (
                    <div className="mb-4 text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        등록 기간: <span className="font-bold">{visitPeriod}</span>
                    </div>
                )}

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
