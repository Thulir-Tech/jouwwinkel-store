
import { getUiConfig } from '@/lib/firestore';

export default async function OurStoryPage() {
  const uiConfig = await getUiConfig();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 font-headline">
          Our Story
        </h1>
        <div className="prose dark:prose-invert lg:prose-lg mx-auto">
            {uiConfig?.ourStoryContent ? (
                <p>
                    {uiConfig.ourStoryContent.split('\n').map((line, index) => (
                        <span key={index}>
                        {line}
                        <br />
                        </span>
                    ))}
                </p>
            ) : (
                <p className="text-center text-muted-foreground">
                    The story has not been written yet. Please check back later.
                </p>
            )}
        </div>
      </div>
    </div>
  );
}
