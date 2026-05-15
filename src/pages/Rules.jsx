import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileWarning, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Loading from '../components/Loading';

const penalties = [
    { reason: '가. 무단 결강자 (시간당)', point: 2 },
    { reason: '나. 외출·외박 시 귀원 시간 무단 미준수자', point: 2 },
    { reason: '다. 고성방가 등 생활관 내에서 생활태도 불량자', point: 2 },
    { reason: '라. 각종 합동행사 무단 불참자', point: 2 },
    { reason: '마. 지시사항 불이행자', point: 2 },
    { reason: '바. 휴대전화 사용 등 학습태도 불량', point: 2 },
    { reason: '사. 금연구역에서의 흡연자', point: 2 },
    { reason: '아. 무단 지각자', point: 1 },
    { reason: '자. 명찰 미패용, 슬리퍼 착용 등 복장불량자', point: 1 },
    { reason: '차. 침구미정리 등 생활관 사용(청소)불량자', point: 1 },
    { reason: '카. 출석부 미서명자( 사전서명 및 대리서명 포함)', point: 1 },
   
];

import { useSettings } from '../context/SettingsContext';

const Rules = () => {
    const { settings, loading } = useSettings();

    if (loading) return <Loading />;

return (
    <div className="space-y-6 pb-10">
        {settings?.life_rules ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="text-nh-blue" />
                    생활 수칙 안내
                </h2>

                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                    {settings.life_rules}
                </div>
            </div>
        ) : (
            <>
                {/* 퇴교사유 */}
                <div className="bg-[#f7f3eb]/95 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        제17조 퇴교사유
                    </h2>

                    <div className="space-y-4">
                        {[
                            '교육생활 평가 가감점 합산 점수가 △10점에 도달한 자',
                            '정당한 사유 없이 수강을 거부한 자',
                            '교육질서 문란행위에 대한 지도교수의 시정 지도를 거부한 자',
                            '무단 외박·외출한 자',
                            '무단음주한 자',
                            '도박, 절도, 폭력 행위를 한 자'
                        ].map((text, idx) => (
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
            </>
        )}
    </div>
);    
