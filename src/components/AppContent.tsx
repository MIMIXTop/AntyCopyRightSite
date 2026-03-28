import React, { useState, useEffect } from 'react';
import { Layout, Typography, Avatar, Input, Card, Table, Tag, Button, message, Tabs, Checkbox, Space, Spin } from 'antd';
import { FileTextOutlined, SearchOutlined, ArrowLeftOutlined, UserOutlined, PaperClipOutlined, ScanOutlined } from '@ant-design/icons';
import { useClassroom } from "./ClassroomContext.tsx";
import { useAuth } from "./AuthContext.tsx";

// Импорт новых компонентов
import { FilePreviewOverlay } from './FilePreviewOverlay';
import { SimilarityMatrix } from './SimilarityMatrix';
import { DashboardView } from './DashboardView';

const { Content } = Layout;
const { Title, Text } = Typography;

export const AppContent: React.FC = () => {
    const { courses, activeCourseId, activeCourseWorkId, courseWorkMap, submissionsMap, loadingWork, loadingCourses, loadingSubmissions, selectCourse, selectCourseWork, studentsMap } = useClassroom();
    const { token } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [previewFile, setPreviewFile] = useState<any | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [similarityData, setSimilarityData] = useState<any[] | null>(null);
    const [fileMetaMap, setFileMetaMap] = useState<Record<string, any>>({});
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

    useEffect(() => {
        setSelectedFileIds([]);
        setSimilarityData(null);
        setSearchQuery('');
    }, [activeCourseId, activeCourseWorkId]);

    const getEmbedUrl = (link: string) => link.includes('/view') ? link.replace(/\/view.*/, '/preview') : link;

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const payloadFiles: any[] = [];
        const meta: Record<string, any> = {};
        const assignments = courseWorkMap[activeCourseId!] || [];
        const submissions = submissionsMap[activeCourseWorkId!] || [];
        const courseStudents = studentsMap[activeCourseId!] || [];

        submissions.forEach(sub => {
            const student = courseStudents.find(s => s.userId === sub.userId);
            sub.assignmentSubmission?.attachments?.forEach(att => {
                if (att.driveFile && selectedFileIds.includes(att.driveFile.id)) {
                    payloadFiles.push({ file: { file_url: att.driveFile.alternateLink.split('/view')[0], file_id: att.driveFile.id } });
                    meta[att.driveFile.id] = { studentName: student?.profile?.name?.fullName, fileName: att.driveFile.title };
                }
            });
        });

        setFileMetaMap(meta);
        try {
            const res = await fetch('https://127.0.0.1:8080/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ filesList: payloadFiles })
            });
            const data = await res.json();
            setSimilarityData(data);
            message.success('Анализ завершен');
        } catch (e) { message.error('Ошибка анализа'); } finally { setIsAnalyzing(false); }
    };

    // Рендер Dashboard
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

    // Рендер страницы Задания
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
                    return <Space><Avatar src={avatar} icon={<UserOutlined />} /><b>{name}</b></Space>;
                }
            },
            { title: 'Статус', dataIndex: 'state', render: (s: string) => <Tag color={s === 'TURNED_IN' ? 'green' : 'default'}>{s}</Tag> },
            { title: 'Дата', dataIndex: 'updateTime', render: (t: string) => new Date(t).toLocaleString() }
        ];

        const rowSelection = {
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
        };

        const expandedRowRender = (record: any) => (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingLeft: '50px' }}>
                {record.assignmentSubmission?.attachments?.filter((a: any) => a.driveFile?.title.toLowerCase().endsWith('.docx')).map((att: any) => (
                    <Space key={att.driveFile.id}>
                        <Checkbox checked={selectedFileIds.includes(att.driveFile.id)} onChange={() => setSelectedFileIds(prev => prev.includes(att.driveFile.id) ? prev.filter(id => id !== att.driveFile.id) : [...prev, att.driveFile.id])} />
                        <Card hoverable size="small" style={{ width: 200, border: selectedFileIds.includes(att.driveFile.id) ? '1px solid #1677ff' : '1px solid #f0f0f0' }} styles={{ body: { padding: 8 } }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Avatar shape="square" size={32} src={att.driveFile.thumbnailUrl} icon={<PaperClipOutlined />} />
                                <Text ellipsis style={{ flex: 1, fontSize: '12px' }}>{att.driveFile.title}</Text>
                                <Button type="text" size="small" icon={<SearchOutlined />} onClick={() => setPreviewFile({ ...att.driveFile, thumbnailUrl: getEmbedUrl(att.driveFile.alternateLink) })} />
                            </div>
                        </Card>
                    </Space>
                ))}
            </div>
        );

        return (
            <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => selectCourseWork(null)} style={{ marginBottom: 20 }}>Назад</Button>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <Title level={3}>{currentWork?.title}</Title>
                        <Button type="primary" icon={<ScanOutlined />} loading={isAnalyzing} onClick={handleAnalyze} disabled={selectedFileIds.length < 2} size="large">Анализировать ({selectedFileIds.length})</Button>
                    </div>
                    <Tabs items={[
                        { key: '1', label: 'Работы', children: <Table rowSelection={rowSelection} dataSource={submissions.map(s => ({ ...s, key: s.id }))} columns={columns} loading={loadingSubmissions} expandable={{ expandedRowRender, defaultExpandedRowKeys: submissions.map(s => s.id) }} /> },
                        { key: '2', label: 'Матрица', children: <SimilarityMatrix data={similarityData} metaMap={fileMetaMap} /> }
                    ]} />
                </Card>
                <FilePreviewOverlay file={previewFile} onClose={() => setPreviewFile(null)} />
            </Content>
        );
    }

    // Рендер ленты заданий курса
    const assignments = courseWorkMap[activeCourseId] || [];
    return (
        <Content style={{ margin: '24px 16px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ height: '200px', borderRadius: '8px', marginBottom: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('https://www.gstatic.com/classroom/themes/img_graduation.jpg')`, backgroundSize: 'cover', color: 'white' }}>
                    <Title level={1} style={{ color: 'white', margin: 0 }}>{activeCourse?.name}</Title>
                </div>
                <Input placeholder="Поиск заданий..." prefix={<SearchOutlined />} size="large" style={{ marginBottom: 20 }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} allowClear />
                {loadingWork ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                            <div key={item.id} onClick={() => selectCourseWork(item.id)} style={{ background: 'white', borderRadius: '8px', border: '1px solid #dadce0', padding: '16px 20px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#5f6368', marginRight: '16px' }} size="large" />
                                <Text strong>{item.title}</Text>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Content>
    );
};