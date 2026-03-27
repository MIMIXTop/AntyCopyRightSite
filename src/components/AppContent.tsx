import React, { useState, useEffect } from 'react';
import {
    Layout, Empty, Spin, Typography, Avatar, Input, Row, Col,
    Card, Table, Tag, Button, Statistic
} from 'antd';
import {
    FileTextOutlined, SearchOutlined, BookOutlined, ArrowLeftOutlined,
    CheckCircleOutlined, UserOutlined, PaperClipOutlined, CloseOutlined, ExportOutlined
} from '@ant-design/icons';
import { useClassroom } from "./ClassroomContext.tsx";

const { Content } = Layout;
const { Title, Text } = Typography;

export const AppContent: React.FC = () => {
    const {
        courses, activeCourseId, activeCourseWorkId, courseWorkMap, submissionsMap,
        loadingWork, loadingCourses, loadingSubmissions, selectCourse, selectCourseWork, studentsMap
    } = useClassroom();

    const [searchQuery, setSearchQuery] = useState('');

    // Стейт для полноэкранного окна
    const [previewFile, setPreviewFile] = useState<{ title: string, alternateLink: string, thumbnailUrl?: string } | null>(null);

    // Блокируем прокрутку страницы на заднем фоне, когда открыт предпросмотр
    useEffect(() => {
        if (previewFile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [previewFile]);

    const getEmbedUrl = (alternateLink: string) => {
        if (alternateLink.includes('/view')) {
            return alternateLink.replace(/\/view.*/, '/preview');
        }
        return alternateLink;
    };

    // --- 1. РЕЖИМ ГЛАВНОЙ (DASHBOARD) ---
    if (activeCourseId === 'dashboard' || !activeCourseId) {
        const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>Курсы</Title>
                    <Input
                        placeholder="Поиск курсов..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: 300 }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                    />
                </div>

                {loadingCourses ? (
                    <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredCourses.map(course => (
                            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <div style={{
                                            height: 100,
                                            background: '#1677ff',
                                            padding: 16,
                                            backgroundImage: 'url(https://www.gstatic.com/classroom/themes/img_graduation.jpg)',
                                            backgroundSize: 'cover'
                                        }} />
                                    }
                                    onClick={() => selectCourse(course.id)}
                                >
                                    <Card.Meta
                                        avatar={<Avatar icon={<BookOutlined />} />}
                                        title={course.name}
                                        description={course.section || 'Основной раздел'}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
                {filteredCourses.length === 0 && !loadingCourses && <Empty description="Курсы не найдены" />}
            </Content>
        );
    }

    const activeCourse = courses.find(c => c.id === activeCourseId);

    // --- 2. РЕЖИМ СТРАНИЦЫ ЗАДАНИЯ (СДАЧИ И СЧЕТЧИК) ---
    if (activeCourseWorkId) {
        const assignments = courseWorkMap[activeCourseId] || [];
        const currentWork = assignments.find(w => w.id === activeCourseWorkId);
        const submissions = submissionsMap[activeCourseWorkId] || [];

        const turnedInCount = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED').length;
        const totalStudents = submissions.length;
        const courseStudents = activeCourseId ? studentsMap[activeCourseId] || [] : [];

        const columns = [
            {
                title: 'Студент',
                dataIndex: 'userId',
                key: 'userId',
                render: (userId: string) => {
                    const student = courseStudents.find(s => s.userId === userId);
                    const name = student?.profile?.name?.fullName || `Студент ${userId}`;

                    let avatarSrc: string | undefined = undefined;
                    const rawPhotoUrl = student?.profile?.photoUrl;
                    if (rawPhotoUrl) {
                        avatarSrc = rawPhotoUrl.startsWith('//') ? `https:${rawPhotoUrl}` : rawPhotoUrl;
                    }

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar src={avatarSrc} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                            <span style={{ fontWeight: 500 }}>{name}</span>
                        </div>
                    );
                }
            },
            {
                title: 'Статус',
                dataIndex: 'state',
                key: 'state',
                render: (state: string) => {
                    if (state === 'TURNED_IN') return <Tag color="green">Сдано</Tag>;
                    if (state === 'RETURNED') return <Tag color="blue">Оценено</Tag>;
                    return <Tag color="default">Назначено</Tag>;
                }
            },
            {
                title: 'Дата сдачи',
                dataIndex: 'updateTime',
                key: 'updateTime',
                render: (time: string) => time ? new Date(time).toLocaleString() : 'Нет данных'
            }
        ];

        const expandedRowRender = (record: any) => {
            const attachments = record.assignmentSubmission?.attachments || [];

            if (attachments.length === 0) {
                return <Text type="secondary" style={{ marginLeft: 45 }}>Нет прикрепленных файлов</Text>;
            }

            return (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingLeft: '45px' }}>
                    {attachments.map((att: any, index: number) => {
                        const file = att.driveFile;
                        if (!file) return null;

                        return (
                            <Card
                                key={index}
                                hoverable
                                size="small"
                                style={{ width: 220, borderRadius: 8, overflow: 'hidden' }}
                                styles={{ body: { padding: 12 } }}
                                onClick={() => setPreviewFile({
                                    title: file.title,
                                    alternateLink: file.alternateLink,
                                    thumbnailUrl: getEmbedUrl(file.alternateLink),
                                })}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Avatar
                                        shape="square"
                                        size={40}
                                        src={file.thumbnailUrl}
                                        icon={<PaperClipOutlined />}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text ellipsis style={{ display: 'block', fontWeight: 500, fontSize: '13px' }}>
                                            {file.title}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            Google Drive
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            );
        };

        return (
            <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => selectCourseWork(null)}
                    style={{ marginBottom: 20 }}
                >
                    Назад к ленте курса
                </Button>

                <Card>
                    <Title level={3}>{currentWork?.title}</Title>
                    <Text type="secondary">{currentWork?.description}</Text>

                    <Row gutter={32} style={{ marginTop: 24, marginBottom: 24 }}>
                        <Col>
                            <Statistic
                                title="Сдали работу"
                                value={turnedInCount}
                                suffix={`/ ${totalStudents}`}
                                styles={{ content: { color: '#3f8600' } }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Col>
                    </Row>

                    <Table
                        dataSource={submissions.map(s => ({ ...s, key: s.id }))}
                        columns={columns}
                        loading={loadingSubmissions}
                        pagination={{ pageSize: 10 }}
                        expandable={{
                            expandedRowRender,
                            defaultExpandedRowKeys: submissions.filter(s => s.state === 'TURNED_IN').map(s => s.id)
                        }}
                    />
                </Card>

                {/* --- НАСТОЯЩИЙ ПОЛНОЭКРАННЫЙ СЛОЙ (ВМЕСТО MODAL) --- */}
                {previewFile && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#323639', // Цвет оригинального Google Viewer
                        zIndex: 99999, // 100% поверх сайдбара и шапки
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* ТЕМНАЯ ШАПКА КАК В GOOGLE DRIVE */}
                        <div style={{
                            height: '60px',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0 20px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <FileTextOutlined style={{ fontSize: '24px', color: '#8ab4f8' }} />
                                <Typography.Text style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>
                                    {previewFile.title}
                                </Typography.Text>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <Button
                                    type="text"
                                    icon={<ExportOutlined />}
                                    href={previewFile.alternateLink}
                                    target="_blank"
                                    style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}
                                >
                                    Открыть в Google Drive
                                </Button>
                                {/* КНОПКА ЗАКРЫТИЯ */}
                                <Button
                                    type="text"
                                    icon={<CloseOutlined style={{ fontSize: '20px' }} />}
                                    onClick={() => setPreviewFile(null)}
                                    style={{ color: 'white' }}
                                />
                            </div>
                        </div>

                        {/* САМ ДОКУМЕНТ (IFRAME) */}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <iframe
                                src={previewFile.thumbnailUrl}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allowFullScreen
                                title="Предпросмотр документа"
                            />
                        </div>
                    </div>
                )}
            </Content>
        );
    }

    // --- 3. РЕЖИМ СТРАНИЦЫ КУРСА (ЛЕНТА ЗАДАНИЙ) ---
    const assignments = courseWorkMap[activeCourseId] || [];
    const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    height: '240px', borderRadius: '8px', marginBottom: '24px', padding: '24px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('https://www.gstatic.com/classroom/themes/img_graduation.jpg')`,
                    backgroundSize: 'cover', backgroundPosition: 'center', color: 'white'
                }}>
                    <Title level={1} style={{ color: 'white', margin: 0 }}>{activeCourse?.name}</Title>
                    <Text style={{ color: 'white', fontSize: '18px' }}>{activeCourse?.section}</Text>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <Input
                        placeholder="Поиск заданий..."
                        prefix={<SearchOutlined />}
                        size="large"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                    />
                </div>

                {loadingWork ? (
                    <div style={{ textAlign: 'center', marginTop: 40 }}><Spin /></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredAssignments.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => selectCourseWork(item.id)}
                                style={{
                                    background: 'white', borderRadius: '8px', border: '1px solid #dadce0',
                                    padding: '16px 20px', display: 'flex', alignItems: 'center', cursor: 'pointer',
                                    transition: 'box-shadow 0.2s, background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#5f6368', marginRight: '16px' }} size="large" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#3c4043' }}>{item.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredAssignments.length === 0 && !loadingWork && <Empty description="Задания не найдены" />}
            </div>
        </Content>
    );
};