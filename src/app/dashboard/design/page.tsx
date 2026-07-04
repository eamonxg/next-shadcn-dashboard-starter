import PageContainer from '@/components/layout/page-container';
import { DesignSpec } from '@/features/news-tips/components/design-spec';

export const metadata = {
  title: '驾驶舱设计规范'
};

export default function DesignPage() {
  return (
    <PageContainer
      pageTitle='驾驶舱设计规范'
      pageDescription='报料线索驾驶舱的色彩、状态和图表交互规范'
    >
      <DesignSpec />
    </PageContainer>
  );
}
