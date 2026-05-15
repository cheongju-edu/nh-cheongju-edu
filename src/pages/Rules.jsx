import React from 'react';
import { AlertTriangle, FileWarning, BookOpen } from 'lucide-react';
import Loading from '../components/Loading';
import { useSettings } from '../context/SettingsContext';

const Rules = () => {
    const { settings, loading } = useSettings();

    if (loading) return <Loading />;

    const expulsionRules =
        settings?.expulsion_rules
            ?.split('\n')
            .filter(Boolean) || [];

    const penalties =
        settings?.penalty_rules
            ?.split('\n')
            .filter(Boolean)
            .map((line) => {
                const [reason, point] = line.split('|');

                return {
                    reason,
                    point
                };
            }) || [];

    return (
        <div className="space-y-6 pb-10">

            {/* 생활수칙 안내 */}
            {settings?.life_rules && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="text-nh-blue" />
                        생활 수칙 안내
                    </h2>

                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                        {settings.life_rules}
                    </div>
                </div>
            )}

            {/* 퇴교사유 */}
            <div className="bg-[#f7f3eb]/95 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" />
                    제17조 퇴교사유
                </h2>

                <div className="space-y-4">
                    {expulsionRules.map((text, idx) => (
                        <div
                            key={idx}
                            className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-gray-700 font-medium shadow-sm"
                        >
                            {idx + 1}. {text}
                        </div>
                    ))}
                </div>
            </div>

            {/* 벌점 기준표 */}
            <div className="bg-[#f7f3eb]/95 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileWarning className="text-red-400" />
                    벌점 기준표
                </h2>

                <div className="space-y-4">
                    {penalties.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl px-5 py-4 shadow-sm flex justify-between items-center"
                        >
                            <span className="text-gray-700 font-medium text-sm leading-relaxed">
                                {item.reason}
                            </span>

                            <span className="text-red-500 font-bold text-lg whitespace-nowrap">
                                -{item.point}점
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Rules;
