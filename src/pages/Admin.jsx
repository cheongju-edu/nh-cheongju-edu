import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

const Admin = () => {
    const [settings, setSettings] = useState({
        center_name: '',
        slogan: '',
        main_description: '',
        bg_image_url: '',
        operation_password: '', // 추가된 필드
        facility_map_url: '',
        facility_info_1: '',
        facility_info_2: '',
        facility_info_3: '',
        facility_info_4: '',
        facility_info_5: '',
        facility_info_6: '',
        facility_info_7: '',
        facility_info_8: '',
        meal_breakfast: '',
meal_lunch: '',
meal_dinner: '',
        meal_guide: '',
        complaint_info: '',
        rest_rules: '',
        smoking_rules: '',
        life_rules: '',
        expulsion_rules: '',
penalty_rules: '',
        checkout_banner_text: '',
        checkout_img_1: '',
        checkout_img_2: '',
        checkout_img_3: '',
        checkout_img_4: '',
        checkout_checklist: '',
        course_list: '',
        outing_start_time: '18:00',
        outing_end_time: '22:55'
    });
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [facilityMapFile, setFacilityMapFile] = useState(null);
    const [checkoutImgFiles, setCheckoutImgFiles] = useState([null, null, null, null]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .order('id', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    }

async function updateSettings() {
    try {
        setIsSaving(true);

        let finalBgImageUrl = settings.bg_image_url;

        // 배경 이미지 업로드
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `backgrounds/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error(uploadError);
                alert('이미지 업로드 실패');
                return;
            }

            const {
                data: { publicUrl }
            } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            finalBgImageUrl = publicUrl;
        }

        // 시설안내 이미지 업로드
        let finalFacilityMapUrl = settings.facility_map_url;

        if (facilityMapFile) {
            const fileExt = facilityMapFile.name.split('.').pop();
            const fileName = `map_${Math.random()}.${fileExt}`;
            const filePath = `backgrounds/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, facilityMapFile);

            if (uploadError) {
                console.error(uploadError);
                alert('조감도 업로드 실패');
                return;
            }

            const {
                data: { publicUrl }
            } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            finalFacilityMapUrl = publicUrl;
        }

        // 퇴실 이미지 업로드
        let finalCheckoutImgUrls = [
            settings.checkout_img_1,
            settings.checkout_img_2,
            settings.checkout_img_3,
            settings.checkout_img_4
        ];

        for (let i = 0; i < 4; i++) {
            if (checkoutImgFiles[i]) {
                const fileExt = checkoutImgFiles[i].name.split('.').pop();
                const fileName = `checkout_${i}_${Math.random()}.${fileExt}`;
                const filePath = `backgrounds/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, checkoutImgFiles[i]);

                if (uploadError) {
                    console.error(uploadError);
                    alert(`퇴실안내 이미지 ${i + 1} 업로드 실패`);
                    return;
                }

                const {
                    data: { publicUrl }
                } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                finalCheckoutImgUrls[i] = publicUrl;
            }
        }

        // 저장 데이터 정리
        const {
            id,
            checkout_info,
            facility_info,
            ...dataToSave
        } = settings;

        const payload = {
            ...dataToSave,
            bg_image_url: finalBgImageUrl,
            facility_map_url: finalFacilityMapUrl,
            checkout_img_1: finalCheckoutImgUrls[0],
            checkout_img_2: finalCheckoutImgUrls[1],
            checkout_img_3: finalCheckoutImgUrls[2],
            checkout_img_4: finalCheckoutImgUrls[3]
        };

        const { error } = await supabase
            .from('site_settings')
            .update(payload)
            .eq('id', settings.id);

        if (error) {
            console.error(error);
            alert('저장 실패');
            return;
        }

        setSettings({
            id: 1,
            ...payload
        });

        setImageFile(null);
        setFacilityMapFile(null);
        setCheckoutImgFiles([null, null, null, null]);

        alert('성공적으로 저장되었습니다!');
    } catch (error) {
        console.error(error);
        alert('저장 중 오류 발생');
    } finally {
        setIsSaving(false);
    }
}
async function downloadStayRequests() {
    const { data, error } = await supabase
        .from('stay_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert('데이터 다운로드 실패');
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        alert('신청 데이터가 없습니다.');
        return;
    }

    const formatDate = (value) => {
        if (!value) return '';
        try {
            return format(new Date(value), 'yyyy-MM-dd HH:mm');
        } catch {
            return '';
        }
    };

    const workbook = new ExcelJS.Workbook();
    const today = new Date().toISOString().slice(0, 10);
    const worksheet = workbook.addWorksheet(`외출외박신청_${today}`);

    // 열 너비 설정
    worksheet.columns = [
        { width: 32 },  // 출발시간
        { width: 24 },  // 과정명
        { width: 8 },   // 교번
        { width: 7 },   // 이름
        { width: 5 },   // 구분
        { width: 15 },  // 목적지
        { width: 12 },  // 실제복귀시간
        { width: 8 },   // 상태
    ];

    // 1행: 제목
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '외출관리대장';
    titleCell.font = { name: '맑은 고딕', size: 20, bold: true, underline: 'double' };
    titleCell.alignment = { horizontal: 'center', vertical: 'center' };
    worksheet.getRow(1).height = 29;

    // 2행: 헤더
    const headerRow = worksheet.addRow([
        '출발시간', '과정명', '교번', '이름', '구분', '목적지', '실제복귀시간', '상태'
    ]);
    headerRow.eachCell((cell) => {
        cell.font = { name: '맑은 고딕', bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDCE6F1' }
        };
    });
    headerRow.height = 18.45;

    // 데이터 행 (컬럼 순서: 교번 → 이름)
    data.forEach(item => {
        worksheet.addRow([
            formatDate(item.created_at),
            item.course_name || '',
            item.student_id || '',
            item.name || '',
            item.type || '',
            item.destination || '',
            formatDate(item.returned_at),
            item.status || ''
        ]);
    });

    // 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `외출외박신청_${today}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

//  if (loading) return <div className="p-8 font-medium text-gray-600">데이터를 불러오는 중...</div>;

    const handleLogin = (e) => {
        e.preventDefault();
        const expectedPwd = import.meta.env.VITE_ADMIN_PASSWORD;
        if (passwordInput === expectedPwd) {
            setIsAuthenticated(true);
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/20 max-w-sm w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">관리자 로그인</h2>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition shadow-md">
                        확인
                    </button>
                </form>
            </div>
        );
    }

    if (loading) return <div className="p-8 font-medium text-gray-600">데이터를 불러오는 중...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-2">🚩 교육원 앱 관리자 페이지</h1>

            {/* 앱 기본 설정 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">앱 기본 설정</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">교육원 명칭</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={settings.center_name}
                            onChange={(e) => setSettings({ ...settings, center_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">메인 슬로건</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={settings.slogan || ''}
                            onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">메인 상세 설명(긴 문구)</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            rows="3"
                            value={settings.main_description || ''}
                            onChange={(e) => setSettings({ ...settings, main_description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">배경 이미지 업로드</label>
                        {settings.bg_image_url && (
                            <div className="mb-2">
                                <img src={settings.bg_image_url} alt="현재 배경" className="h-32 w-auto object-cover rounded shadow-sm border border-gray-200" />
                                <p className="text-xs text-gray-500 mt-1">현재 적용된 이미지</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md p-2"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">외출/외박 신청 시작 시간</label>
                            <input
                                type="time"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={settings.outing_start_time || '18:00'}
                                onChange={(e) => setSettings({ ...settings, outing_start_time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">외출/외박 신청 종료 시간</label>
                            <input
                                type="time"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={settings.outing_end_time || '22:55'}
                                onChange={(e) => setSettings({ ...settings, outing_end_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">관리자 운영 비밀번호 (외출/건의사항 등)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-yellow-50"
                            value={settings.operation_password || ''}
                            onChange={(e) => setSettings({ ...settings, operation_password: e.target.value })}
                            placeholder="운영 비밀번호를 입력해주세요"
                        />
                        <p className="text-xs text-gray-500 mt-1">* '/admin' 비밀번호와 별개로, 앱 내 관리자 기능 사용 시 요구되는 비번입니다.</p>
                    </div>
                </div>
            </div>

            {/* 시설안내 설정 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">시설안내 설정 (조감도 및 범례)</h2>
                <div className="space-y-4">
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">조감도 이미지 업로드</label>
                        {settings.facility_map_url && (
                            <div className="mb-2">
                                <img src={settings.facility_map_url} alt="현재 조감도" className="h-40 w-auto object-cover rounded shadow-sm border border-gray-200" />
                                <p className="text-xs text-gray-500 mt-1">현재 적용된 조감도</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-md p-2"
                            onChange={(e) => setFacilityMapFile(e.target.files[0])}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <div key={num}>
                                <label className="block text-sm font-medium text-gray-700">[{num}] 마커 설명</label>
                                <textarea
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                                    rows="2"
                                    value={settings[`facility_info_${num}`] || ''}
                                    onChange={(e) => setSettings({ ...settings, [`facility_info_${num}`]: e.target.value })}
                                    placeholder={`${num}번 시설 설명을 입력하세요`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 생활안내 설정 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">생활안내 설정</h2>
                <div className="space-y-4">
                   
                   <div className="space-y-4">

    <div>
        <label className="block text-sm font-medium text-gray-700">
            🍳 조식 시간
        </label>

        <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings.meal_breakfast || ''}
            onChange={(e) =>
                setSettings({
                    ...settings,
                    meal_breakfast: e.target.value
                })
            }
            placeholder="예:07:00 ~ 08:30"
        />
    </div>

    <div>
        <label className="block text-sm font-medium text-gray-700">
            🍱 중식 시간
        </label>

        <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings.meal_lunch || ''}
            onChange={(e) =>
                setSettings({
                    ...settings,
                    meal_lunch: e.target.value
                })
            }
            placeholder="예:11:30 ~ 13:00"
        />
    </div>

    <div>
        <label className="block text-sm font-medium text-gray-700">
            🍽 석식 시간
        </label>

        <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings.meal_dinner || ''}
            onChange={(e) =>
                setSettings({
                    ...settings,
                    meal_dinner: e.target.value
                })
            }
            placeholder="예:17:30 ~ 19:00"
        />
    </div>

</div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">불편사항 접수</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={settings.complaint_info || ''}
                            onChange={(e) => setSettings({ ...settings, complaint_info: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">휴식/정숙</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={settings.rest_rules || ''}
                            onChange={(e) => setSettings({ ...settings, rest_rules: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">흡연 구역 안내</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={settings.smoking_rules || ''}
                            onChange={(e) => setSettings({ ...settings, smoking_rules: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* 생활수칙 설정 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">생활수칙 설정</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">생활 수칙 </label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            rows="6"
                            value={settings.life_rules || ''}
                            onChange={(e) => setSettings({ ...settings, life_rules: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
        퇴교사유 / 벌점 설정
    </h2>

    <div className="space-y-5">

        {/* 퇴교사유 */}
        <div>
            <label className="block text-sm font-medium text-gray-700">
                퇴교사유
            </label>

            <p className="text-xs text-gray-500 mb-2">
                한 줄에 하나씩 입력하세요.
            </p>

            <textarea
                rows="6"
                className="w-full border border-gray-300 rounded-md p-3"
                value={settings.expulsion_rules || ''}
                onChange={(e) =>
                    setSettings({
                        ...settings,
                        expulsion_rules: e.target.value
                    })
                }
                placeholder={`생활성적 감점점수 10점 초과
정당한 사유 없이 수업 거부
고의로 교육질서를 문란케 한 자`}
            />
        </div>

        {/* 벌점기준표 */}
        <div>
            <label className="block text-sm font-medium text-gray-700">
                벌점 기준표
            </label>

            <p className="text-xs text-gray-500 mb-2">
                형식: 내용|점수
            </p>

            <textarea
                rows="10"
                className="w-full border border-gray-300 rounded-md p-3"
                value={settings.penalty_rules || ''}
                onChange={(e) =>
                    setSettings({
                        ...settings,
                        penalty_rules: e.target.value
                    })
                }
                placeholder={`무단 결강자|2
외출·외박 시 귀원 시간 미준수|2
무단 지각자|1`}
            />
        </div>

    </div>
</div>
{/* 과정 목록 관리 */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
        📚 과정 목록 관리
    </h2>

    <div>
        <label className="block text-sm font-medium text-gray-700">
            과정명 목록
        </label>

        <p className="text-xs text-gray-500 mb-2">
            한 줄에 하나씩 입력하세요.
        </p>

        <textarea
            className="mt-1 block w-full border border-gray-300 rounded-md p-3"
            rows="6"
            value={settings.course_list || ''}
            onChange={(e) =>
                setSettings({
                    ...settings,
                    course_list: e.target.value
                })
            }
            placeholder={`예:농협신입직원과정
금융마케팅과정
하나로리더과정`}
        />
    </div>
</div>
            {/* 퇴실 안내 설정 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">퇴실 안내 설정</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">배너 문구</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={settings.checkout_banner_text || ''}
                            onChange={(e) => setSettings({ ...settings, checkout_banner_text: e.target.value })}
                            placeholder="예: 퇴실 전 아래 항목들을 꼭 확인해주세요!"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">안내 사진 업로드 (최대 4장)</label>
                        <div className="grid grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((idx) => (
                                <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <span className="text-xs font-bold text-gray-600 block mb-2">사진 {idx + 1}</span>
                                    {settings[`checkout_img_${idx+1}`] && (
                                        <img
  src={settings[`checkout_img_${idx+1}`]}
  alt={`미리보기 ${idx+1}`}
  className="w-full h-auto rounded mb-2 border"
/>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full text-xs"
                                        onChange={(e) => {
                                            const newFiles = [...checkoutImgFiles];
                                            newFiles[idx] = e.target.files[0];
                                            setCheckoutImgFiles(newFiles);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">체크리스트 관리</label>
                        <p className="text-xs text-gray-500 mb-1">엔터(줄바꿈)로 각 항목을 구분하여 입력하세요.</p>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            rows="5"
                            value={settings.checkout_checklist || ''}
                            onChange={(e) => setSettings({ ...settings, checkout_checklist: e.target.value })}
                            placeholder="1. 이불 (전체 배출)&#13;&#10;2. 개인 소지품 확인"
                        />
                    </div>
                </div>
            </div>

         <div className="space-y-3">

    <button
        onClick={downloadStayRequests}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition shadow-md mt-4"
    >
        📥 외출/외박 신청자 엑셀 다운로드
    </button>

    <button
        onClick={updateSettings}
        disabled={isSaving}
        className={`w-full font-bold py-3 rounded-md transition text-white shadow-md ${
            isSaving
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
        }`}
    >
        {isSaving
            ? '이미지 업로드 및 설정 저장 중...'
            : '설정 저장하기'}
    </button>
</div>
</div>
    );
};

export default Admin;
