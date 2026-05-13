import React from 'react';
import { Button, Typography, Space } from 'antd';
import { FileTextOutlined, ExportOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
    file: { title: string, alternateLink: string, thumbnailUrl?: string } | null;
    onClose: () => void;
}

export const FilePreviewOverlay: React.FC<Props> = ({ file, onClose }) => {
    if (!file) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#323639', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '60px', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <FileTextOutlined style={{ fontSize: '24px', color: '#8ab4f8' }} />
                    <Text style={{ color: 'white' }}>{file.title}</Text>
                </div>
                <Space>
                    <Button type="text" icon={<ExportOutlined />} href={file.alternateLink} target="_blank" style={{ color: 'white' }}>Открыть Drive</Button>
                    <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={{ color: 'white' }} />
                </Space>
            </div>
            <iframe src={file.thumbnailUrl} style={{ flex: 1, border: 'none' }} allowFullScreen title="Preview" />
        </div>
    );
};