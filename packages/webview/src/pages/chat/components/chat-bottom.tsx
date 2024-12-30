import { inject, observer } from 'mobx-react';
import { ChatInputComponent } from './chat-input';
import React, { Component, createRef, RefObject } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { reaction, observable, runInAction } from 'mobx';
import UserUploadFormWrapper from './chat-input/functional_wrapper/user-form-wrapper';
import ModalWrapper from './chat-input/functional_wrapper/modal-wrapper';
import { ModalRef } from './chat-input/custom-modal';
import {
  handleSendFile,
  formatMessageContent,
} from '../../../helpers/string.helper';
// Define a type for the state
interface ChatBottomState {
  isModalOpen: boolean;
}
@inject('rootStore')
@observer
export class ChatBottomComponent extends Component<
  BaseComponentProps,
  ChatBottomState
> {
  @observable isTyping = false; // Local observable to track typing state

  private disposers: (() => void)[] = []; // Array to hold disposers for cleanup
  modalRef: any;

  formComponentRef: any;
  private get rootStore() {
    return this.props.rootStore!;
  }
  private get chatViewModel() {
    return this.rootStore.chatViewModel;
  }
  private get topicStore() {
    return this.rootStore.topicStore;
  }
  private get messageStore() {
    return this.rootStore.messageStore;
  }
  private chatInputRef: RefObject<ChatInputComponent>;

  constructor(props: BaseComponentProps) {
    super(props);
    this.state = {
      isModalOpen: false, // State to control modal visibility
    };
    this.chatInputRef = createRef<ChatInputComponent>();
    this.formComponentRef = React.createRef();
    this.modalRef = createRef<ModalRef>();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    reaction(
      () => this.formComponentRef.current?.file,
      file => {
        const payload = {
          file: file,
          name: file.name,
          type: file.type,
        };
        this.rootStore.zulipService.postUserUpload(payload);
      },
    );
    if (prevState.isModalOpen !== this.state.isModalOpen) {
      console.log('Modal visibility changed:', this.state.isModalOpen);
    }
  }

  componentDidMount() {
    const messageStore = this.messageStore;
    // Create a reaction to track `messageStore.isTyping` and update `isTyping`
    if (messageStore) {
      const isTypingDisposer = reaction(
        () => messageStore.isTyping,
        isTyping => {
          runInAction(() => {
            this.isTyping = isTyping ?? false; // Default to false if undefined
          });
        },
        { fireImmediately: true }, // Ensures this effect runs on initialization
      );
      // Add disposer to the list
      this.disposers.push(isTypingDisposer);
    }
  }

  componentWillUnmount() {
    // Clean up all reactions
    this.disposers.forEach(dispose => dispose());
  }

  handleSendMessage = async (inputValue?: string) => {
    const uploadContent = this.formComponentRef.current?.file
      ? await handleSendFile(
          this.formComponentRef.current?.file,
          this.rootStore.zulipService.postUserUpload.bind(
            this.rootStore.zulipService.postUserUpload,
          ),
        )
      : undefined;
    if (uploadContent !== undefined) {
      await this.rootStore.zulipService.addFile(
        this.rootStore.topicStore.currentTopic?.name
          ? this.rootStore.topicStore.currentTopic?.name
          : '',
        this.formComponentRef.current?.file[0].name,
        this.formComponentRef.current?.file[0].path,
        undefined,
        undefined,
        undefined,
        'coding_context_file',
      );
      const finalMessage = formatMessageContent(
        inputValue,
        uploadContent,
        null,
      );
      await this.chatViewModel.onSendMessage(finalMessage);
      // Clear file after sending
      this.formComponentRef.current.clearFile();
    }
    await this.chatViewModel.onSendMessage(inputValue);
  };

  handleOpenModal = () => {
    this.modalRef.current?.open();
  };

  handleCloseModal = () => {
    this.modalRef.current?.close();
  };

  render() {
    const tabs = [
      {
        key: 'command-instruction',
        label: 'Command Instruction',
        content: {
          type: 'table',
          headers: ['Command', 'Prompt Guide'],
          rows: [
            {
              type: 'row',
              data: [
                {
                  type: 'html',
                  command: '<p>/db_create_table</p>',
                  instruction: `<p>Yêu cầu dành cho prompting tạo câu khởi tạo bảng cơ sở dữ liệu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <ol>
                  <li>Tên cơ sử dữ liệu bạn đang sử dụng.</li>
                  <li>Tên bảng và mục đích sử dụng.</li>
                  <li>Tên cột, kiểu dữ liệu, và các ràng buộc (ví dụ: khóa chính, khóa ngoại, ràng buộc duy nhất).</li>
                  <li>Quan hệ giữa các bảng (nếu có).</li>
                  </ol>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_modify_table</p>',
                  instruction: `<p>Yêu cầu dành cho prompting tạo câu chỉnh sửa bảng cơ sở dữ liệu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <ol> 
                  <li>Tên cơ sử dữ liệu bạn đang sử dụng.</li>
                  <li>Tên bảng và mục đích sử dụng.</li>
                  <li>Tên cột, kiểu dữ liệu, và các ràng buộc bạn muốn thay đổi.</li>
                  <li>Quan hệ giữa các bảng nếu bạn cần thay đổi.</li>
                  </ol>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_create_query</p>',
                  instruction: `<p>Yêu cầu dành cho prompting tạo câu truy vấn bảng cơ sở dữ liệu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <ol> 
                  <li>Tên cơ sử dữ liệu bạn đang sử dụng.</li>
                  <li>Tên bảng và mục đích sử dụng.</li>
                  <li>Tên các trường cần trích xuất.</li>
                  <li>Quan hệ giữa các bảng (nếu có).</li>
                  </ol>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_modify_query</p>',
                  instruction: `<p>Yêu cầu dành cho prompting tạo câu chỉnh sửa câu truy vấn cơ sở dữ liệu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <ol> 
                  <li>Tên cơ sử dữ liệu bạn đang sử dụng.</li>
                  <li>Tên bảng và mục đích sử dụng.</li>
                  <li>Tên các trường cần trích xuất.</li>
                  <li>Quan hệ giữa các bảng (nếu có).</li>
                  </ol>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_fix_query</p>',
                  instruction: `<p>Yêu cầu dành cho prompting chỉnh sửa câu truy vấn của bạn đến cơ sở dữ liệu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <hr> 
                  <p>Tên cơ sử dữ liệu bạn đang sử dụng.</p>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_optimize_query</p>',
                  instruction: `<p>Yêu cầu dành cho prompting kiểm tra câu truy vấn bảng cơ sở dữ liệu và đưa ra phương án tối ưu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <ol> 
                  <li>Tên cơ sử dữ liệu bạn đang sử dụng.</li>
                  <li>Tên bảng và mục đích sử dụng.</li>
                  <li>Tên cột, kiểu dữ liệu, và các ràng buộc (ví dụ: khóa chính, khóa ngoại, ràng buộc duy nhất).</li>
                  <li>Quan hệ giữa các bảng (nếu có).</li>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_format_query</p>',
                  instruction: `<p>Yêu cầu dành cho prompting kiểm câu truy vấn bảng cơ sở dữ liệu và refactor lại, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <hr> 
                  <p>Tên cơ sử dữ liệu bạn đang sử dụng.</p>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_explain_query</p>',
                  instruction: `<p>Yêu cầu dành cho prompting kiểm câu truy vấn bảng cơ sở dữ liệu và giải thích câu truy vấn bạn gửi đến, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <hr> 
                  <p>Tên cơ sử dữ liệu bạn đang sử dụng.</p>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/db_generate_data</p>',
                  instruction: `<p>Yêu cầu dành cho prompting tạo mã SQL commands dành cho tạo mới dữ liệu mẫu, để promting hiệu quả hãy cung cấp đầy đủ các thông tin sau</p>
                  <ol> 
                    <li>Tên cơ sử dữ liệu bạn đang sử dụng.</li>
                    <li>Tên bảng và mục đích sử dụng.</li>
                    <li>Tên các trường và kiểu dữ liệu mà bảng bạn yêu cầu tạo dữ liệu.</li>
                    <li>Quan hệ giữa các bảng (nếu có).</li>
                  </ol>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/html</p>',
                  instruction: `<p>Tạo mã HTML, CSS và JavaScript dựa trên đoạn mã được bạn cung cấp, các thành phần HTML và bất kỳ ảnh chụp màn hình nào đi kèm (nếu có).</p>
                  <hr> 
                  <p>Cung cấp thêm thông tin về cấu trúc, element, tags và mong muốn của chức năng theo mục đích của bạn</p>
                  <strong> Ví dụ:</strong>
                  <span>Giúp tôi thay đổi css của .button-confirm sang màu đỏ</span>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/html_item</p>',
                  instruction: `<p>Sửa mã HTML, CSS và JavaScript dựa trên đoạn mã được bạn cung cấp, các thành phần HTML và bất kỳ ảnh chụp màn hình nào đi kèm (nếu có). Hãy cung cấp theo cấu trúc như sau:</p>
                  <ol> 
                    <li>/add /item:"Element name" /type:"Element type" [kèm các thông tin đi cùng mục đích của bạn].</li>
                    <li>/edit /item:"Element name" /type:"Element type" [kèm các thông tin đi cùng mục đích của bạn].</li>
                    <li>/remove /item:"Element name".</li>
                  </ol>
                  <hr>
                  <strong> Ví dụ:</strong>
                  <span>/add /item:h1 /type:tag với nội dung Tiêu đề 1</span>
                  `,
                },
                {
                  type: 'html',
                  command: '<p>/vuejs</p>',
                  instruction: `<p>Giúp đỡ bạn trong việc thực hiện coding với framework Vuejs, các thành phần HTML, CSS, Javascript và bất kỳ ảnh chụp màn hình nào đi kèm (nếu có). Hãy cung cấp theo cấu trúc như sau:</p>
                  <ol> 
                    <li>/vuejs --option</li>
                    <li>Giá trị option bạn có thể lựa chọn sau đây
                      <ul>
                        <li>Options API</li>
                        <li>Composition API</li>
                      </ul>
                    </li>
                  </ol>
                  `,
                },
                {
                  type: 'text',
                  command: '/gen-code',
                  instruction: `Tạo mã tiếp theo dựa trên đoạn mã được bạn cung cấp.`,
                },
                {
                  type: 'text',
                  command: '/gen-test',
                  instruction: `Tạo mã kiểm tra đơn vị để kiểm tra kỹ lưỡng mã được bạn cung cấp.`,
                },
                {
                  type: 'text',
                  command: '/comment',
                  instruction: `Tạo các comment code phù hợp cho mã được bạn cung cấp.`,
                },
                {
                  type: 'html',
                  command: '/porting',
                  instruction: `<p>Chuyển đổi mã được bạn cung cấp sang ngôn ngữ lập trình khác.<p> <strong>Hãy nêu ra ngôn ngữ bạn muốn chuyển đổi<strong>`,
                },
                {
                  type: 'text',
                  command: '/explain',
                  instruction: `Cung cấp lời giải thích chi tiết về đoạn mã được bạn cung cấp.`,
                },
                {
                  type: 'text',
                  command: '/improve',
                  instruction: `Cải tiến và sắp xếp lại đoạn mã được bạn cung cấp để có hiệu suất, khả năng đọc hoặc khả năng bảo trì tốt hơn.`,
                },
                {
                  type: 'text',
                  command: '/review',
                  instruction: `Đưa ra đánh giá mã được bạn cung cấp, thêm bình luận và đề xuất cải tiến hoặc chỉnh sửa.`,
                },
                {
                  type: 'text',
                  command: '/fixbug',
                  instruction: `Xác định các lỗi tiềm ẩn trong mã được bạn cung cấp, đề xuất cách sửa lỗi tương ứng.`,
                },
              ],
            },
          ],
        },
      },
    ];
    return (
      <div className="bottom-block vc-border">
        <div className="context-block">
          <div className="add-context vc-border">
            <i
              className="codicon codicon-add"
              onClick={() => this.topicStore.selectAddContextMethod()}
            />
          </div>
          <div className="context-list">
            {this.topicStore.currentTopic?.file_inputs?.map((file, index) => (
              <div className="context-file vc-border" key={index}>
                <div
                  className="file c-pointer"
                  onClick={() => this.chatViewModel.openInputFile(file)}
                >
                  <span>{file.name}</span>
                  {file.isSelection && (
                    <span>
                      :{file.start}-{file.end}
                    </span>
                  )}
                </div>
                <i
                  className="remove codicon codicon-close"
                  onClick={() => this.topicStore.onRemoveFile(file)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="input-block">
          <ChatInputComponent
            ref={this.chatInputRef}
            onSendMessage={this.handleSendMessage}
          />
        </div>
        <div className="action-block">
          <div className="action-left">
            <div className="action-icon">
              <UserUploadFormWrapper ref={this.formComponentRef} />
            </div>
            <div className="action-icon">
              <i className="codicon codicon-mention" />
            </div>
            <div className="action-icon">
              {/* Trigger modal open from here */}
              {/* Trigger modal open */}
              <i
                className="codicon codicon-question"
                onClick={this.handleOpenModal}
              />
            </div>
          </div>
          <div className="action-right">
            <div
              className={`action-icon ${
                this.messageStore.isTyping ? 'disabled' : ''
              }`} // Optionally add a disabled class for styling
              onClick={() => {
                if (!this.messageStore.isTyping) {
                  this.chatInputRef.current?.onSubmitInput();
                } else {
                  this.rootStore.postMessageToVSCode({
                    command: 'raiseMessageToVscodeWindow',
                    data: {
                      message:
                        "Cannot send a message while waiting agent's response",
                    },
                  });
                }
              }}
            >
              <i
                className={`codicon ${
                  this.messageStore.isTyping
                    ? 'codicon-debug-stop'
                    : 'codicon-send'
                }`}
              />
            </div>
          </div>
        </div>
        {/* ModalWrapper remains hidden until triggered */}
        <ModalWrapper ref={this.modalRef} tabs={tabs} />
      </div>
    );
  }
}
