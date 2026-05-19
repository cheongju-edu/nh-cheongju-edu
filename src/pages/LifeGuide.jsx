import React, { useState, useEffect } from 'react';
import { Clock, Phone, VolumeX, Cigarette, UserCheck, Utensils } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Loading from '../components/Loading';

const defaultRules = [
    { icon: UserCheck, title: '인사', key: 'greeting', defaultDesc: '다들 서로가 처음이시죠. 우리 먼저 인사 나눠요. (명찰 착용 권장)' },
    { icon: Utensils, title: '식사 가이드', key: 'meal_guide', defaultDesc: '농협청주교육원은 밥맛이 전국 최고! 3끼 식사 꼭 하세요.' },
    { icon: Phone, title: '불편사항 접수', key: 'complaint_info', defaultDesc: '일과시간 중: 지도교수/반장, 이후: 당직자 (043-299-5500)' },
    { icon: VolumeX, title: '휴식/정숙', key: 'rest_rules', defaultDesc: '23시 이후에는 조용히~ (세탁기사용,대화 등 자제)' },
    { icon: Cigarette, title: '흡연 구역 안내', key: 'smoking_rules', defaultDesc: '비흡연자를 위해 담배는 야외(지정 구역)에서만!' },
    { icon: Clock, title: '강의실 이동', key: 'class_move', defaultDesc: '수업시작 5분전까지 강의실에 착석해 주세요.' },
];

import { useSettings } from '../context/SettingsContext';

const LifeGuide = () => {
    const { settings, loading } = useSettings();

    if (loading) return <Loading />;

    return (
        <div className="space-y-8">
           {/* Meal Time */}
<section>
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Utensils className="text-nh-green" /> 식사 시간 안내
    </h2>

    <div className="grid grid-cols-1 gap-4">

        {/* 조식 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm font-medium text-yellow-700">
                        조식
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {settings?.meal_breakfast || '관리자가 등록 예정입니다.'}
                    </p>
                </div>

                <div className="text-4xl">
                    🍳
                </div>

            </div>
        </div>

        {/* 중식 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm font-medium text-green-700">
                        중식
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {settings?.meal_lunch || '관리자가 등록 예정입니다.'}
                    </p>
                </div>

                <div className="text-4xl">
                    🍱
                </div>

            </div>
        </div>

        {/* 석식 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm font-medium text-blue-700">
                        석식
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {settings?.meal_dinner || '관리자가 등록 예정입니다.'}
                    </p>
                </div>

                <div className="text-4xl">
                    🍽
                </div>

            </div>
        </div>

    </div>
</section>

            {/* Rules Grid */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCheck className="text-nh-blue" /> 생활 가이드
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {defaultRules.map((rule, index) => {
                        const dynamicDesc = settings?.[rule.key] || rule.defaultDesc;
                        return (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <div className="p-2 bg-gray-50 rounded-full mb-2 text-gray-700">
                                    <rule.icon size={24} />
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm mb-1">{rule.title}</h3>
                                <p className="text-xs text-gray-500 break-keep">{dynamicDesc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default LifeGuide;
