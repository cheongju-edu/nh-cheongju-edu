import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { Lock, PenTool, ChevronLeft, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Suggestions = () => {
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'write', 'detail'
    const [selectedPost, setSelectedPost] = useState(null);
    const [editingPost, setEditingPost] = useState(null);

    // Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    // Write Form State
    const [formData, setFormData] = useState({
    title: '',
    content: '',
    isSecret: false,
    password: '',
    attachment: null
});

    // Password Prompt State
    const [inputPassword, setInputPassword] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [pendingPost, setPendingPost] = useState(null);

   
    // Fetch Suggestions
    const fetchSuggestions = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('suggestions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching suggestions:", error);
        } else {
            setSuggestions(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    // Handle Write Submit
useEffect(() => {
    fetchSuggestions();
}, [fetchSuggestions]);

// Handle Write Submit
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    if (formData.isSecret && !formData.password) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    let attachmentUrl = null;
    let attachmentName = null;

    // 파일 업로드
    if (formData.attachment) {
        const fileName = `${Date.now()}_${formData.attachment.name}`;

        const { error: uploadError } = await supabase.storage
            .from('notice-files')
            .upload(fileName, formData.attachment);

        if (uploadError) {
            console.error(uploadError);
            alert('파일 업로드 실패');
            return;
        }

        const { data } = supabase.storage
            .from('notice-files')
            .getPublicUrl(fileName);

        attachmentUrl = data.publicUrl;
        attachmentName = formData.attachment.name;
    }

    // DB 저장
let error;

if (editingPost) {

    // 수정
    const result = await supabase
        .from('suggestions')
        .update({
            title: formData.title,
            content: formData.content,
            is_secret: formData.isSecret,
            password: formData.isSecret ? formData.password : null,
            attachment_url: attachmentUrl || editingPost.attachment_url,
            attachment_name: attachmentName || editingPost.attachment_name
        })
        .eq('id', editingPost.id);

    error = result.error;

} else {

    // 신규 등록
    const result = await supabase
        .from('suggestions')
        .insert([
            {
                title: formData.title,
                content: formData.content,
                is_secret: formData.isSecret,
                password: formData.isSecret ? formData.password : null,
                attachment_url: attachmentUrl,
                attachment_name: attachmentName
            }
        ]);

    error = result.error;
}
    if (error) {
        console.error(error);
        alert('등록 실패');
        return;
    }

   alert(editingPost ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');

    setFormData({
        title: '',
        content: '',
        isSecret: false,
        password: '',
        attachment: null
    });
    setEditingPost(null);
    setView('list');
    fetchSuggestions();
};

    // Handle Post Click
    const handlePostClick = (post) => {
        if (post.is_secret) {
            setPendingPost(post);
            setInputPassword('');
            setShowPasswordPrompt(true);
        } else {
            setSelectedPost(post);
          
            setView('detail');
        }
    };

    const { settings } = useSettings();

    // Handle Password Verification
    const verifyPassword = () => {
        const opPassword = settings?.operation_password || '1234';
        if (showAdminLogin) {
            if (inputPassword === opPassword) {
                setIsAdmin(true);
                setShowAdminLogin(false);
                setShowPasswordPrompt(false);
                alert('관리자 모드가 활성화되었습니다.');
            } else {
                alert('관리자 비밀번호가 일치하지 않습니다.');
            }
            return;
        }

        if (!pendingPost) return;

        // Privacy Logic
        const isPostPasswordMatch = inputPassword === pendingPost.password;
        const isAdminPasswordMatch = inputPassword === opPassword;

        // In normal mode, only post password works.
        // In admin mode, both post password and admin password work.
        if (isPostPasswordMatch || (isAdmin && isAdminPasswordMatch)) {
            setSelectedPost(pendingPost);
            
            setView('detail');
            setShowPasswordPrompt(false);
            setPendingPost(null);
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };
const handleEdit = (post) => {

    setFormData({
        title: post.title,
        content: post.content,
        isSecret: post.is_secret,
        password: post.password || '',
        attachment: null
    });

    setEditingPost(post);

    setView('write');
};
const handleDelete = async (id) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

    try {
        const { error } = await supabase
            .from('suggestions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('삭제되었습니다.');

        setView('list');
        fetchSuggestions();

    } catch (error) {
        console.error(error);
        alert('삭제 중 오류가 발생했습니다.');
    }
};
    const openAdminLogin = () => {
        if (isAdmin) {
            setIsAdmin(false);
            alert('관리자 모드가 해제되었습니다.');
        } else {
            setInputPassword('');
            setShowAdminLogin(true);
            setShowPasswordPrompt(true);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {view !== 'list' && (
                        <button onClick={() => setView('list')} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-800">공지사항</h2>
                </div>
                <div className="flex items-center gap-2">
                    {view === 'list' && isAdmin && (
                        <button
                            onClick={() => setView('write')}
                            className="bg-nh-blue text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm hover:bg-blue-700"
                        >
                            <PenTool size={16} />
                            공지 작성
                        </button>
                    )}
                    <button
                        onClick={openAdminLogin}
                        className={`p-2 rounded-full ${isAdmin ? 'bg-nh-blue text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <Lock size={20} />
                    </button>
                </div>
            </div>

           

            {/* List View */}
            {view === 'list' && (
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">로딩 중...</p>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400">등록된 공지사항이 없습니다.</p>
                        </div>
                    ) : (
                        suggestions.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => handlePostClick(post)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-800 line-clamp-1 flex-1">
                                        {post.is_secret && !isAdmin ? "🔒 관리자 전용 공지입니다." : post.title}
                                    </h3>
                                    {post.is_secret && <Lock size={16} className="text-gray-400 ml-2 flex-shrink-0" />}
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{format(new Date(post.created_at), 'yyyy.MM.dd HH:mm')}</span>
                                    <div className="flex gap-2">
                                       
                                        {post.is_secret && <span className="text-orange-500">비밀글</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Write View */}
            {view === 'write' && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:border-nh-blue focus:ring-1 focus:ring-nh-blue outline-none"
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">내용</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg h-40 resize-none focus:border-nh-blue focus:ring-1 focus:ring-nh-blue outline-none"
                                placeholder="내용을 입력하세요"
                            />
                            <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">
        첨부파일
    </label>

    <input
        type="file"
        onChange={(e) =>
            setFormData({
                ...formData,
                attachment: e.target.files[0]
            })
        }
        className="w-full p-2 border border-gray-200 rounded-lg bg-white"
    />
</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isSecret"
                                    checked={formData.isSecret}
                                    onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                                    className="w-4 h-4 text-nh-blue rounded border-gray-300 focus:ring-nh-blue"
                                />
                                <label htmlFor="isSecret" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                    비밀글로 작성하기
                                </label>
                            </div>

                            {formData.isSecret && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded bg-white text-sm"
                                        placeholder="비밀번호 설정 (필수)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">* 관리자와 본인만 확인할 수 있습니다.</p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-nh-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                           {editingPost ? '수정 완료' : '등록하기'}
                        </button>
                    </form>
                </div>
            )}

            {/* Detail View */}
            {view === 'detail' && selectedPost && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedPost.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{format(new Date(selectedPost.created_at), 'yyyy.MM.dd HH:mm')}</span>
                            {selectedPost.is_secret && (
                                <span className="flex items-center gap-1 text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                                    <Lock size={10} /> 비밀글
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="min-h-[200px] text-gray-700 whitespace-pre-wrap leading-relaxed">
    {selectedPost.content}

    {selectedPost.attachment_url && (
        <div className="mt-4">
            <a
                href={selectedPost.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 underline"
            >
                📎 {selectedPost.attachment_name}
            </a>
        </div>
    )}
</div>
{isAdmin && (
    <button
        onClick={() => handleEdit(selectedPost)}
        className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-bold hover:bg-yellow-600 flex items-center justify-center gap-2 mb-2"
    >
        ✏️ 게시글 수정
    </button>
)}
                    {isAdmin && (
    <button
        onClick={() => handleDelete(selectedPost.id)}
        className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2"
    >
        <Trash2 size={18} />
        게시글 삭제
    </button>
)}
                    <button
                        onClick={() => setView('list')}
                        className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            )}

            {/* Password Prompt Modal */}
            {showPasswordPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-xs p-6 rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-500 rounded-full mb-2">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {showAdminLogin ? '관리자 로그인' : '비밀글입니다'}
                            </h3>
                            <p className="text-sm text-gray-500">비밀번호를 입력해주세요.</p>
                        </div>
                        <input
                            type="password"
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg mb-3 text-center text-lg tracking-widest"
                            placeholder="****"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowPasswordPrompt(false);
                                    setShowAdminLogin(false);
                                }}
                                className="flex-1 py-2.5 text-gray-500 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={verifyPassword}
                                className="flex-1 py-2.5 text-white bg-nh-blue rounded-lg font-bold hover:bg-blue-700"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suggestions;
