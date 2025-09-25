import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsModal: React.FC<LegalModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>服务条款</DialogTitle>
          <DialogDescription>最近更新：{new Date().toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-700 leading-6">
          <p>
            欢迎使用敲鸭社区。本《服务条款》（以下简称“本条款”）是您与敲鸭社区就您使用本站及相关服务所达成的法律协议。访问或使用本站即表示您已阅读并同意受本条款约束。
          </p>
          <h3 className="font-semibold text-gray-900">1. 账户与安全</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>您应对账户及密码的保密、安全负责，因保管不善导致的损失由您自行承担。</li>
            <li>发现账户被未授权使用时，请立即联系我们处理。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">2. 使用规范</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>请勿从事任何违法、侵权、恶意攻击、商业抓取或破坏服务稳定性的行为。</li>
            <li>不得擅自复制、传播、售卖课程内容与资料；不得共享账号供多人使用。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">3. 知识产权</h3>
          <p>本站所有课程、代码、图文、音视频等内容之版权及相关权利归敲鸭社区或相应权利人所有。未经许可，任何人不得以任何方式复制、转载、传播或用于商业用途。</p>

          <h3 className="font-semibold text-gray-900">4. 订阅与付费</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>订阅价格、有效期、权益以页面展示为准。</li>
            <li>
              本平台提供的是<span className="font-semibold">在线数字内容/会员服务</span>。<span className="font-semibold text-red-600">服务一经开通不支持退款</span>
              （法律法规另有规定或平台另行承诺的除外）；为确保知情同意，我们会在支付页显著提示并要求确认。
            </li>
            <li>如遇<span className="font-semibold">重复支付、无法开通、重大服务故障</span>等情形，请联系微信 <span className="font-mono">xhyQAQ250</span> 协助处理。</li>
            <li>如发现违规使用（如账号共享、恶意爬取、传播课程），平台有权采取限制或终止服务等措施。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">5. 服务变更与中断</h3>
          <p>我们可能基于业务调整对功能进行修改或下线；因不可抗力或系统维护导致的服务中断，我们将尽力恢复，但对此不承担超出法律规定范围之外的责任。</p>

          <h3 className="font-semibold text-gray-900">6. 免责声明与责任限制</h3>
          <p>本站按“现状”提供，您因使用服务而产生的任何间接损失、数据丢失、利润损失等不在我们赔偿范围内。我们对第三方链接、第三方服务不承担保证或连带责任。</p>

          <h3 className="font-semibold text-gray-900">7. 适用法律与争议解决</h3>
          <p>本条款适用中华人民共和国法律。与本条款相关的争议，由敲鸭社区所在地人民法院管辖。</p>

          <h3 className="font-semibold text-gray-900">8. 联系我们</h3>
          <p>如有问题或投诉，您可通过 B 站主页或微信联系我们：微信号 <span className="font-mono">xhyQAQ250</span>。</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PrivacyModal: React.FC<LegalModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>隐私政策</DialogTitle>
          <DialogDescription>最近更新：{new Date().toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-700 leading-6">
          <p>
            本《隐私政策》说明我们如何收集、使用、共享与保护您的个人信息，以及您对个人信息的相关权利。使用本站即表示您已阅读并同意本政策。
          </p>

          <h3 className="font-semibold text-gray-900">1. 我们收集的信息</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>账户信息：邮箱、昵称、头像等；</li>
            <li>使用数据：访问日志、设备信息、浏览与学习记录；</li>
            <li>支付相关：目前采用线下转账方式，不采集支付敏感信息。若需您提供转账截图，仅用于核验开通，处理完毕即删除或最小化保留。</li>
            <li>通信信息：您与我们的沟通内容（客服/反馈）。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">2. 信息的使用目的</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>提供与维护服务（登录、学习记录、课程权益等）；</li>
            <li>安全风控与故障排查；</li>
            <li>统计分析与产品优化；</li>
            <li>在取得您的同意后进行通知或营销（可随时取消）。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">3. 信息共享与第三方</h3>
          <p>为实现必要功能，我们可能与第三方服务商（如对象存储、统计分析、邮件/短信、支付渠道）合作，严格按照最小必要原则共享，并与其签署数据保护协议。</p>

          <h3 className="font-semibold text-gray-900">4. 数据存储与安全</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>我们采用加密、访问控制、审计等措施保护数据安全；</li>
            <li>除法律法规另有规定外，我们仅在达成处理目的所需的最短期间内保存您的数据；</li>
            <li>发生安全事件时，我们将按法规要求告知您并采取补救措施。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">5. 您的权利</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>查阅、更正、删除您的个人信息；</li>
            <li>撤回同意、注销账户、获取副本；</li>
            <li>就隐私问题向我们反馈，我们将在合理期限内处理。</li>
          </ul>

          <h3 className="font-semibold text-gray-900">6. 未成年人保护</h3>
          <p>若您为未成年人，请在监护人监护、指导下使用本服务，并在征得监护人同意后提交个人信息。</p>

          <h3 className="font-semibold text-gray-900">7. 本政策的更新</h3>
          <p>我们可能适时更新本政策。重大变更时，我们会通过站内通知或页面公告进行提示。</p>

          <h3 className="font-semibold text-gray-900">8. 联系我们</h3>
          <p>您可通过 B 站主页或微信与我们联系：微信号 <span className="font-mono">xhyQAQ250</span>。</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
