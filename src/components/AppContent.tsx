import React, { useState, useEffect } from 'react';
import { Layout, Typography, Avatar, Input, Card, Table, Tag, Button, message, Tabs, Checkbox, Space, Spin, theme } from 'antd';
import { FileTextOutlined, SearchOutlined, ArrowLeftOutlined, UserOutlined, PaperClipOutlined, ScanOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { useClassroom } from "./ClassroomContext.tsx";
import { useAuth } from "./AuthContext.tsx";

import { FilePreviewOverlay } from './FilePreviewOverlay';
import { SimilarityMatrix } from './SimilarityMatrix';
import { DashboardView } from './DashboardView';
import type { DriveFile, FileMeta, Submission, Attachment } from '../types/auth';

const { Content } = Layout;
const { Title, Text } = Typography;

interface PayloadFile {
    file: {
        file_url: string;
        file_id: string;
    };
}

export const AppContent: React.FC = () => {
    const { token: antdToken } = theme.useToken();
    const { courses, activeCourseId, activeCourseWorkId, courseWorkMap, submissionsMap, loadingWork, loadingCourses, loadingSubmissions, selectCourse, selectCourseWork, studentsMap } = useClassroom();
    const { token } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [similarityData, setSimilarityData] = useState<any | null>(null);
    const [fileMetaMap, setFileMetaMap] = useState<Record<string, FileMeta>>({});
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

    useEffect(() => {
        setSelectedFileIds([]);
        setSimilarityData(null);
        setSearchQuery('');
    }, [activeCourseId, activeCourseWorkId]);

    const getEmbedUrl = (link: string) => link.includes('/view') ? link.replace(/\/view.*/, '/preview') : link;

    // --- ВОССТАНОВЛЕННАЯ ФУНКЦИЯ АНАЛИЗА ---
    const handleAnalyze = async () => {
        if (!activeCourseWorkId || selectedFileIds.length < 2) return;

        setIsAnalyzing(true);
        const payloadFiles: PayloadFile[] = [];
        const meta: Record<string, FileMeta> = {};
        const submissions = submissionsMap[activeCourseWorkId] || [];
        const courseStudents = studentsMap[activeCourseId!] || [];

        submissions.forEach(sub => {
            const student = courseStudents.find(s => s.userId === sub.userId);
            sub.assignmentSubmission?.attachments?.forEach((att: Attachment) => {
                if (att.driveFile && selectedFileIds.includes(att.driveFile.id)) {
                    payloadFiles.push({
                        file: {
                            file_url: att.driveFile.alternateLink.split('/view')[0],
                            file_id: att.driveFile.id
                        }
                    });
                    meta[att.driveFile.id] = {
                        studentName: student?.profile?.name?.fullName ?? 'Неизвестный',
                        fileName: att.driveFile.title
                    };
                }
            });
        });

        setFileMetaMap(meta);
        try {
            const res = await fetch('https://127.0.0.1:8080/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filesList: payloadFiles })
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setSimilarityData(data);
            message.success('Анализ успешно завершен');
        } catch (e) {
            message.error('Ошибка при выполнении анализа');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (activeCourseId === 'dashboard' || !activeCourseId) {
        return <DashboardView
            courses={courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
            loading={loadingCourses}
            search={searchQuery}
            onSearch={setSearchQuery}
            onSelect={selectCourse}
        />;
    }

    const activeCourse = courses.find(c => c.id === activeCourseId);

    if (activeCourseWorkId) {
        const submissions = submissionsMap[activeCourseWorkId] || [];
        const currentWork = (courseWorkMap[activeCourseId] || []).find(w => w.id === activeCourseWorkId);
        const courseStudents = studentsMap[activeCourseId] || [];

        const columns = [
            {
                title: 'Студент',
                dataIndex: 'userId',
                render: (uid: string) => {
                    const s = courseStudents.find(st => st.userId === uid);
                    const name = s?.profile?.name?.fullName || uid;
                    const avatar = s?.profile?.photoUrl?.startsWith('//') ? `https:${s.profile.photoUrl}` : s?.profile?.photoUrl;
                    return <Space><Avatar src={avatar} icon={<UserOutlined />} style={{ backgroundColor: '#EADDFF' }} /><b style={{ color: '#1D1B20' }}>{name}</b></Space>;
                }
            },
            { title: 'Статус', dataIndex: 'state', render: (s: string) => (
                    <Tag bordered={false} color={s === 'TURNED_IN' ? 'green' : 'default'} style={{ borderRadius: 8 }}>
                        {s === 'TURNED_IN' ? 'Сдано' : s === 'RETURNED' ? 'Оценено' : 'Назначено'}
                    </Tag>
                )},
            { title: 'Дата сдачи', dataIndex: 'updateTime', render: (t: string) => <Text type="secondary">{t ? new Date(t).toLocaleString() : '—'}</Text> }
        ];

        const expandedRowRender = (record: Submission) => (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px 24px', background: 'rgba(0,0,0,0.02)', borderRadius: 12 }}>
                {record.assignmentSubmission?.attachments?.filter((a) => a.driveFile?.title.toLowerCase().endsWith('.docx')).map((att) => {
                    const isSelected = selectedFileIds.includes(att.driveFile!.id);
                    return (
                        <div
                            key={att.driveFile!.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: isSelected ? '#EADDFF' : '#ECE6F0',
                                padding: '10px 16px', borderRadius: 20, cursor: 'pointer',
                                transition: '0.2s', border: isSelected ? `1px solid ${antdToken.colorPrimary}` : '1px solid transparent'
                            }}
                            onClick={() => setSelectedFileIds(prev => prev.includes(att.driveFile!.id) ? prev.filter(id => id !== att.driveFile!.id) : [...prev, att.driveFile!.id])}
                        >
                            <Checkbox checked={isSelected} />
                            <Avatar shape="square" size={24} src={att.driveFile!.thumbnailUrl} icon={<PaperClipOutlined />} />
                            <Text strong={isSelected} style={{ fontSize: '13px', color: '#1D1B20' }}>{att.driveFile!.title}</Text>
                            <Button
                                type="text" size="small" icon={<SearchOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewFile({ ...att.driveFile!, thumbnailUrl: getEmbedUrl(att.driveFile!.alternateLink) });
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );

        return (
            <Content style={{ padding: '24px', width: '100%' }}>
                <Button
                    type="text" icon={<ArrowLeftOutlined />}
                    onClick={() => selectCourseWork(null)}
                    style={{ marginBottom: 16, color: '#6750A4', fontWeight: 500 }}
                >
                    Назад к списку заданий
                </Button>

                <Card variant="borderless" style={{ background: '#F3EDF7', width: '100%', borderRadius: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={2} style={{ margin: 0, color: '#1D1B20' }}>{currentWork?.title}</Title>
                        <Button
                            type="primary" icon={<ScanOutlined />}
                            loading={isAnalyzing}
                            onClick={handleAnalyze}
                            disabled={selectedFileIds.length < 2}
                            style={{ height: 48, borderRadius: 24, padding: '0 24px' }}
                        >
                            Анализировать ({selectedFileIds.length})
                        </Button>
                    </div>

                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            { key: '1', label: 'Работы студентов', children: (
                                    <Table
                                        rowSelection={{
                                            type: 'checkbox',
                                            selectedRowKeys: submissions.filter(sub => {
                                                const docx = sub.assignmentSubmission?.attachments?.filter(a => a.driveFile?.title.toLowerCase().endsWith('.docx')) || [];
                                                return docx.length > 0 && docx.every(f => selectedFileIds.includes(f.driveFile!.id));
                                            }).map(s => s.id),
                                            onChange: (keys: any) => {
                                                let newIds = [...selectedFileIds];
                                                submissions.forEach(sub => {
                                                    const docx = sub.assignmentSubmission?.attachments?.filter(a => a.driveFile?.title.toLowerCase().endsWith('.docx')).map(a => a.driveFile!.id) || [];
                                                    if (keys.includes(sub.id)) docx.forEach(id => { if (!newIds.includes(id)) newIds.push(id); });
                                                    else newIds = newIds.filter(id => !docx.includes(id));
                                                });
                                                setSelectedFileIds(newIds);
                                            }
                                        }}
                                        dataSource={submissions.map(s => ({ ...s, key: s.id }))}
                                        columns={columns}
                                        pagination={false}
                                        loading={loadingSubmissions}
                                        expandable={{
                                            expandedRowRender,
                                            defaultExpandedRowKeys: submissions.map(s => s.id),
                                            expandIcon: ({ expanded, onExpand, record }) =>
                                                expanded ? (
                                                    <DownOutlined style={{ color: '#6750A4' }} onClick={e => onExpand(record, e)} />
                                                ) : (
                                                    <RightOutlined style={{ color: '#6750A4' }} onClick={e => onExpand(record, e)} />
                                                )
                                    }}
                                    />
                                )},
                            { key: '2', label: 'Матрица схожести', children: <SimilarityMatrix data={similarityData} metaMap={fileMetaMap} /> }
                        ]}
                    />
                </Card>
                <FilePreviewOverlay file={previewFile} onClose={() => setPreviewFile(null)} />
            </Content>
        );
    }

    const assignments = courseWorkMap[activeCourseId] || [];
    return (
        <Content style={{ padding: '24px', width: '100%' }}>
            <div style={{ width: '100%' }}>
                <div style={{
                    height: '240px', borderRadius: 28, marginBottom: '24px', padding: '40px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    background: 'linear-gradient(135deg, #6750A4 0%, #D0BCFF 100%)',
                    boxShadow: '0 4px 12px rgba(103, 80, 164, 0.2)'
                }}>
                    <Title level={1} style={{ color: 'white', margin: 0 }}>{activeCourse?.name}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>{activeCourse?.section}</Text>
                </div>

                <Input
                    placeholder="Поиск заданий..." prefix={<SearchOutlined style={{ color: '#6750A4' }} />}
                    size="large" style={{ marginBottom: 24, borderRadius: 28, height: 56, background: '#F3EDF7', border: 'none' }}
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} allowClear
                />

                {loadingWork ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                            <div
                                key={item.id} onClick={() => selectCourseWork(item.id)}
                                style={{
                                    background: '#F3EDF7', borderRadius: 16, padding: '20px 28px',
                                    display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#EADDFF'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#F3EDF7'}
                            >
                                <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#6750A4', marginRight: '20px' }} size="large" />
                                <Text strong style={{ fontSize: '16px', color: '#1D1B20' }}>{item.title}</Text>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Content>
    );
};