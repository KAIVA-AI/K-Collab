import { observer } from 'mobx-react';

// stores
import { useRootStore } from 'src/stores';

const TypingIndicator = observer(() => {
  const { typingUsersInfo } = useRootStore();

  if (typingUsersInfo.length === 0) return <></>;
  const USERS_AVATAR_PREVIEW_AMOUNT = 3;

  const Avatars = () => {
    const list = typingUsersInfo.map(
      (user: { avatar_url: any; user_id: number }) => ({
        avatar_url: user.avatar_url,
        id: user.user_id,
      }),
    );

    return (
      <div className="flex -space-x-1">
        {list
          .slice(0, USERS_AVATAR_PREVIEW_AMOUNT)
          .map(({ avatar_url, id }, index) => (
            <div
              key={id || `avatar-${index}`} // Use a unique identifier or fallback to index
              className="h-[20px] w-[20px] relative inline-block rounded-full"
            >
              <img
                className="avatar"
                src={
                  avatar_url ||
                  'https://secure.gravatar.com/avatar/0a18525a190d4049400ec0d7fdfa0332?d=identicon&s=50'
                }
                alt="avatar"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://secure.gravatar.com/avatar/0a18525a190d4049400ec0d7fdfa0332?d=identicon&s=50';
                }}
              />
            </div>
          ))}
        {list.length > USERS_AVATAR_PREVIEW_AMOUNT ? (
          <div className="h-[20px] w-[20px] flex items-center justify-center text-[9px] bg-custom-primary-10 ring-custom-background-100 rounded-full ring-1 text-custom-primary-100 ">
            +{list.length - USERS_AVATAR_PREVIEW_AMOUNT}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <div id="typing_notifications">
      <Avatars />
      <span style={{ padding: '10px' }}>
        {typingUsersInfo
          .map((user: { full_name: string }) => user.full_name)
          .join(', ')}{' '}
        {typingUsersInfo.length > 1 ? 'are' : 'is'} typing{' '}
        <span className="dots-loader" />
      </span>
    </div>
  );
});

export default TypingIndicator;
