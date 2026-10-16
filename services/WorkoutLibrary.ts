import type { Exercise, ExerciseCategory, TrainingLevel, WorkoutPlan, WorkoutSettings } from '../types';

export const LEVELS: Record<TrainingLevel, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
export const SPORTS = [
 { id: 'BOXING', name: 'Boxing', icon: '🥊', equipment: 'Không cần dụng cụ; bao cát là tùy chọn', note: 'Bài mẫu là shadow boxing không đối kháng. Học đấm bao và sparring với huấn luyện viên; quấn tay, đeo găng khi đấm bao.', entry: ['Mới tập: học tư thế, giữ tay và thăng bằng.', 'Đã kiểm soát jab–cross và di chuyển khi đấm.', 'Giữ được kỹ thuật qua nhiều hiệp; đã học né và đổi góc.'], warm: 'Đi tại chỗ, xoay vai nhẹ, di chuyển chân và đấm gió chậm.', cool: 'Đi chậm, thả lỏng vai và cánh tay; thở tự nhiên.' },
 { id: 'JUMP_ROPE', name: 'Nhảy dây', icon: '🪢', equipment: 'Dây phù hợp chiều cao, giày và mặt sàn phẳng', note: 'Nhảy thấp, tiếp đất mềm. Nếu đau gót hoặc gối, đổi sang bước tại chỗ; không cố hoàn thành số lượt.', entry: ['Chưa nhảy liên tục: bắt đầu đoạn ngắn, nghỉ nhiều.', 'Nhảy hai chân ổn định và chuyển chân được.', 'Đã kiểm soát nhịp nhanh, tiếp đất nhẹ, không đau khi tập.'], warm: 'Đi tại chỗ, xoay cổ chân, nhón gót nhẹ và tập quay dây hai bên.', cool: 'Đi chậm, thả lỏng bắp chân; giãn nhẹ trong tầm dễ chịu.' },
 { id: 'WALKING', name: 'Đi bộ', icon: '🚶', equipment: 'Giày vừa chân; đường phẳng hoặc máy đi bộ', note: 'Chọn tốc độ vẫn nói được câu trọn vẹn. Tăng thời lượng trước khi tăng tốc hoặc độ dốc.', entry: ['Bắt đầu với quãng ngắn trên đường phẳng.', 'Đi liên tục 20–30 phút thoải mái.', 'Đi nhanh 40 phút ổn định; sẵn sàng thêm dốc nhẹ.'], warm: 'Đi chậm rồi tăng dần nhịp bước, vai thả lỏng.', cool: 'Giảm tốc dần về đi thong thả, không dừng đột ngột.' },
 { id: 'RUNNING', name: 'Chạy bộ', icon: '🏃', equipment: 'Giày chạy, tuyến đường an toàn', note: 'Chạy nhẹ ở mức còn nói được câu. Các buổi chạy nên xen ngày hồi phục; chưa vững nền tảng thì dùng chạy xen đi bộ.', entry: ['Đi bộ thoải mái, bắt đầu chạy xen đi bộ.', 'Chạy nhẹ liên tục khoảng 20 phút với kỹ thuật ổn định.', 'Có nền chạy đều; đã quen các đoạn tăng tốc có kiểm soát.'], warm: 'Đi bộ 5 phút, tăng dần nhịp; không bắt đầu bằng chạy nhanh.', cool: 'Đi bộ chậm 5 phút cho nhịp thở giảm dần.' },
 { id: 'SWIMMING', name: 'Bơi lội', icon: '🏊', equipment: 'Bể có cứu hộ, kính bơi; ván bơi nếu cần', note: 'Tập ở bể có giám sát, không bơi một mình, không tập nín thở. Mới học cần giáo viên. Đồng hồ chỉ tham khảo: kết thúc lượt ở thành bể, không tăng tốc để chạy theo tiếng báo; để điện thoại trên bờ.', entry: ['Làm quen nước cùng giáo viên, tại vùng đứng được.', 'Bơi được 25–50 m, kiểm soát hơi thở và dừng ở thành bể.', 'Bơi liên tục 200 m thoải mái, kỹ thuật đã vững.'], warm: 'Khởi động vai nhẹ trên bờ, vào nước từ từ; đi trong nước nông hoặc bơi rất chậm theo khả năng.', cool: 'Bơi rất nhẹ hoặc đi trong nước nông; lên bờ an toàn, thả lỏng vai.' },
 { id: 'GYM', name: 'Gym', icon: '🏋️', equipment: 'Máy tập hoặc tạ theo từng bài', note: 'Chọn tạ còn làm thêm được 2–3 lần với kỹ thuật tốt. Mỗi ô thời gian là một hiệp: đủ số lần thì nghỉ phần còn lại, không chạy đua với đồng hồ. Có thể tạm dừng để chỉnh máy.', entry: ['Mới tập: ưu tiên máy, học biên độ và nhịp thở.', 'Đã vững động tác cơ bản và kiểm soát tạ tự do.', 'Có kinh nghiệm tạ tự do, kiểm soát tải và kỹ thuật; không thử mức tối đa.'], warm: 'Đi bộ hoặc xe đạp nhẹ, vận động khớp; làm hiệp rất nhẹ làm quen trước mỗi bài chính.', cool: 'Đi chậm, thả lỏng nhóm cơ đã tập; hít thở tự nhiên.' }
] as const;
export const SOURCES = [
 { name: 'NHS · Chạy xen đi bộ cho người mới', url: 'https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/' },
 { name: 'ACE · Thư viện kỹ thuật động tác', url: 'https://www.acefitness.org/resources/everyone/exercise-library/' },
 { name: 'ACE · Kỹ thuật nhảy dây', url: 'https://www.acefitness.org/resources/everyone/blog/5408/calorie-burning-jump-rope-workout/' },
 { name: 'England Boxing · Shadow boxing', url: 'https://www.englandboxing.org/news_articles/england-boxing-shadow-boxing-drills-week-nine/' },
 { name: 'Swim England · Kỹ thuật bơi', url: 'https://www.swimming.org/masters/masters-training-room/swimming-tips/' },
 { name: 'Swim England · An toàn dưới nước', url: 'https://www.swimming.org/learntoswim/water-safety-code/' }
];
// Original beta session examples, informed by the technique references above; not official programmes.
// category, level, slug, name, seconds, rest, target, instructions, common-error cue
const rows: [string, TrainingLevel, string, string, number, number, string, string, string][] = [
 ['BOXING','beginner','stance','Tư thế và di chuyển',60,45,'Nhẹ · 3/10','Hai chân so le, gối mềm, tay bảo vệ mặt. Bước ngắn tới/lùi và giữ khoảng cách hai chân.','Không bắt chéo chân hoặc ngả người ra trước.'],
 ['BOXING','beginner','jab','Jab đơn',60,45,'Chậm, chính xác · 3–4/10','Từ tư thế thủ, duỗi tay trước có kiểm soát rồi thu ngay về má; tay còn lại giữ mặt.','Không khóa cứng khuỷu hoặc vươn quá tầm.'],
 ['BOXING','beginner','one-two','Jab–cross cơ bản',60,45,'Nhịp đều · 4/10','Đấm tay trước rồi tay sau, xoay hông và chân sau vừa phải; trở lại thế thủ sau mỗi cặp.','Không dùng lực tối đa khi đấm gió.'],
 ['BOXING','intermediate','hook','Jab–cross–hook',120,60,'Kỹ thuật · 5/10','Kết hợp hai đấm thẳng với móc tay trước; xoay thân, giữ cổ tay thẳng và thu tay về.','Không vung cánh tay quá rộng.'],
 ['BOXING','intermediate','slip','Né đòn rồi phản công',120,60,'Có kiểm soát · 5/10','Jab–cross, né nhỏ sang bên bằng gối và hông, trở lại với cross nhẹ.','Không gập cổ hoặc cúi quá thấp.'],
 ['BOXING','intermediate','angle','Đấm rồi đổi góc',120,60,'Bước nhỏ · 5/10','Jab–cross, bước sang bên và xoay góc nhỏ, thiết lập lại thế thủ trước tổ hợp tiếp.','Không xoắn gối khi bàn chân bị ghì xuống sàn.'],
 ['BOXING','advanced','reaction','Phản xạ tấn công–phòng thủ',180,60,'Vừa–khá · 6/10','Luân phiên jab thăm dò, tổ hợp 3 đòn, né nhỏ và phản công; ưu tiên thăng bằng.','Giảm tốc ngay khi tay thủ hạ hoặc mất nhịp chân.'],
 ['BOXING','advanced','levels','Đổi tầng đòn',180,60,'Kỹ thuật nâng cao · 6/10','Đấm gió đầu–thân bằng hạ gối nhẹ, nối móc và đấm thẳng rồi thoát góc.','Không gập lưng để hạ thấp người.'],
 ['BOXING','advanced','tempo','Shadow boxing đổi nhịp',180,60,'Tối đa 7/10','Xen 20 giây tổ hợp nhanh với 40 giây di chuyển và jab nhẹ; lặp lại trong hiệp.','Nhanh nhưng không gồng vai hoặc quăng khớp.'],
 ['JUMP_ROPE','beginner','step','Bước qua dây',30,45,'Làm quen · 2–3/10','Quay dây chậm, bước từng chân qua dây; tập cổ tay dẫn dây, vai thả lỏng.','Dây vướng thì dừng và đặt lại, không cố nhảy cứu.'],
 ['JUMP_ROPE','beginner','bounce','Nhảy hai chân thấp',30,45,'Nhẹ · 4/10','Bật vừa đủ qua dây, gối mềm và tiếp đất nhẹ; có thể xen bước tại chỗ.','Không nhảy cao hoặc tiếp đất cứng.'],
 ['JUMP_ROPE','beginner','rhythm','Nhảy ngắt quãng',30,45,'Giữ nhịp · 4/10','Nhảy 5–10 nhịp, bước tại chỗ vài nhịp rồi tiếp tục; hít thở đều.','Không tăng tốc khi kỹ thuật chưa ổn.'],
 ['JUMP_ROPE','intermediate','alternate','Nhảy đổi chân',60,45,'Vừa · 5/10','Luân phiên chân trái và phải như chạy nhẹ tại chỗ, mỗi vòng dây đổi một chân.','Giữ nhịp thấp, tránh giậm mạnh.'],
 ['JUMP_ROPE','intermediate','boxer','Boxer step',60,45,'Vừa · 5/10','Chuyển trọng lượng nhẹ trái–phải theo nhịp dây, chân còn lại chạm nhẹ sàn.','Không lắc người quá nhiều.'],
 ['JUMP_ROPE','intermediate','side','Nhảy dịch ngang nhỏ',60,45,'Phối hợp · 5/10','Nhảy hai chân sang hai bên với biên độ nhỏ, giữ vai và khuỷu ổn định.','Giữ khoảng trống quanh người và sàn không trơn.'],
 ['JUMP_ROPE','advanced','fast','Nhịp nhanh có hồi phục',90,60,'Khá · 6–7/10','Xen 15 giây nhanh với 30 giây chậm, lặp hai lần; quay dây bằng cổ tay.','Không nhảy hết sức; giảm tốc nếu tiếp đất nặng.'],
 ['JUMP_ROPE','advanced','cross','Bắt chéo dây kỹ thuật',60,60,'Kỹ thuật · 6/10','Sau vài nhịp thường, thử một nhịp bắt chéo rồi mở tay; bước lại nếu vướng.','Chỉ tập khi đã vững nhảy cơ bản; không cần liên tục.'],
 ['JUMP_ROPE','advanced','mix','Phối hợp bước và nhịp',90,60,'Sức bền · 6/10','Đổi giữa boxer step, đổi chân và hai chân mỗi 30 giây.','Duy trì độ cao thấp và nhịp thở đều.'],
 ['WALKING','beginner','easy','Đi bộ thoải mái',180,0,'Nhẹ · 2–3/10','Đi đường phẳng, nhìn phía trước, bước tự nhiên và thả vai.','Không cố sải chân dài.'],
 ['WALKING','beginner','steady','Đi bộ nhịp đều',180,0,'Nói chuyện dễ · 3/10','Tăng nhịp bước một chút, vung tay tự nhiên; giữ tốc độ dễ chịu.','Nếu hụt hơi, giảm nhịp ngay.'],
 ['WALKING','beginner','recover','Đi thư giãn',120,0,'Hồi phục · 2/10','Giảm tốc, thả lỏng bàn tay và vai, tiếp tục bước nhẹ.','Chọn mặt đường ổn định, tránh cát lún nếu đau gót.'],
 ['WALKING','intermediate','brisk','Đi bộ nhanh',480,0,'Vừa · 4–5/10','Bước nhanh hơn nhưng vẫn nói được câu trọn vẹn, thân thẳng tự nhiên.','Không biến thành chạy hoặc gồng vai.'],
 ['WALKING','intermediate','reset','Đi nhẹ hồi phục',180,0,'Nhẹ · 2–3/10','Giảm tốc để nhịp thở trở về dễ chịu trước đoạn tiếp theo.','Không đứng lại đột ngột.'],
 ['WALKING','intermediate','finish','Đi nhanh giữ nhịp',480,0,'Vừa · 4–5/10','Trở lại nhịp nhanh ổn định trên đường phẳng.','Ưu tiên nhịp đều hơn tốc độ hiển thị.'],
 ['WALKING','advanced','long','Đi nhanh bền',900,0,'Vừa · 4–5/10','Duy trì nhịp nhanh dễ kiểm soát; chủ động giảm tốc khi nóng hoặc mệt.','Không gắng giữ một tốc độ cố định bằng mọi giá.'],
 ['WALKING','advanced','incline','Đi dốc nhẹ',300,0,'Khá · 5–6/10','Chọn dốc thoải hoặc độ dốc máy thấp; bước ngắn, không bám tay vịn để kéo người.','Thay bằng đường phẳng nếu gối/gót khó chịu.'],
 ['WALKING','advanced','return','Đi đều sau dốc',600,0,'Vừa · 4/10','Trở lại mặt phẳng, giảm nhịp rồi giữ bước đều.','Không lao nhanh khi đi xuống dốc.'],
 ['RUNNING','beginner','jog','Chạy nhẹ 1 phút',60,0,'Dễ · 3–4/10','Chạy bước ngắn trên đường phẳng, vai mềm; tốc độ đủ để nói chuyện.','Không chạy nước rút ở lượt đầu.'],
 ['RUNNING','beginner','walk','Đi bộ hồi phục',90,0,'Nhẹ · 2–3/10','Đi chậm cho hơi thở ổn định; kéo dài nghỉ nếu cần bằng nút tạm dừng.','Không bắt buộc chạy lại khi còn hụt hơi.'],
 ['RUNNING','beginner','drill','Bước nhanh và đánh tay',60,0,'Kỹ thuật · 3/10','Đi bước nhỏ, đánh tay tự nhiên trước–sau, giữ thân ổn định.','Không nâng gối quá cao hoặc gồng vai.'],
 ['RUNNING','intermediate','easy','Chạy nền nhẹ',600,0,'Dễ · 4/10','Chạy nhịp dễ trò chuyện; giữ sải chân tự nhiên và thở thoải mái.','Không chạy theo tốc độ của người khác.'],
 ['RUNNING','intermediate','recovery','Chạy chậm hoặc đi bộ',180,0,'Hồi phục · 2–3/10','Giảm nhịp rõ rệt; đi bộ nếu cần để kiểm soát hơi thở.','Hồi phục không phải một đoạn thi tốc độ.'],
 ['RUNNING','intermediate','steady','Chạy đều',480,0,'Vừa · 5/10','Tăng nhẹ so với chạy nền, vẫn kiểm soát được nhịp thở.','Nếu chỉ nói được vài từ, giảm tốc.'],
 ['RUNNING','advanced','tempo','Chạy tempo kiểm soát',300,0,'Khá · 6–7/10','Chạy ở mức nói được câu ngắn, giữ kỹ thuật và nhịp ổn định.','Không biến tempo thành nước rút.'],
 ['RUNNING','advanced','float','Chạy rất nhẹ hồi phục',180,0,'Nhẹ · 3/10','Giảm nhịp rõ rệt giữa các đoạn tempo; đi bộ nếu cần.','Phục hồi trước khi tăng nhịp tiếp.'],
 ['RUNNING','advanced','base','Chạy nền trước tempo',480,0,'Dễ · 4/10','Chạy nhẹ để làm nóng thêm sau phần đi bộ khởi động.','Chỉ tăng tốc khi cơ thể đã sẵn sàng.'],
 ['SWIMMING','beginner','breath','Thở ra trong nước tại thành bể',120,30,'Cùng giáo viên · nhẹ','Ở vùng đứng được, giữ thành bể; hít trên mặt nước, úp mặt thở ra nhẹ rồi đứng lên.','Không nín thở hoặc tăng thông khí trước khi úp mặt.'],
 ['SWIMMING','beginner','float','Nổi có hỗ trợ',120,30,'Cùng giáo viên · nhẹ','Tập nổi và trở về tư thế đứng với giáo viên hỗ trợ trong nước nông.','Không tự thử nếu chưa biết lấy lại tư thế đứng.'],
 ['SWIMMING','beginner','kick','Đạp chân có hỗ trợ',120,30,'Nhẹ · 3/10','Giữ thành bể hoặc ván theo hướng dẫn giáo viên, đạp chân nhỏ và thở đều.','Không cố bơi xa khỏi thành bể.'],
 ['SWIMMING','intermediate','crawl','Bơi sải nhẹ từng lượt',180,30,'25 m/lượt · 4/10','Bơi từng lượt 25 m, nghỉ ở thành bể khi cần; thở ra dưới nước và xoay người để lấy hơi.','Không ngẩng đầu cao hoặc nín thở cả lượt.'],
 ['SWIMMING','intermediate','back','Bơi ngửa nhẹ',120,30,'25 m/lượt · 4/10','Giữ đầu ổn định, hông gần mặt nước, tay luân phiên; quan sát mốc báo gần thành.','Chỉ tập khi đã biết bơi ngửa; tránh va thành bể.'],
 ['SWIMMING','intermediate','breast','Bơi ếch kỹ thuật',180,30,'25 m/lượt · 4/10','Phối hợp kéo tay, lấy hơi, đạp chân và lướt; giữ nhịp chậm có kiểm soát.','Không ép gối xoay rộng; đổi kiểu bơi nếu khó chịu.'],
 ['SWIMMING','advanced','endurance','Bơi sải bền',300,45,'Các lượt 50 m · 5/10','Nối các lượt 50 m nhịp đều; nghỉ ở thành bể nếu kỹ thuật giảm.','Độ dài lượt quan trọng hơn chạy theo đồng hồ.'],
 ['SWIMMING','advanced','pace','Bơi đổi nhịp',240,45,'25 m khá / 25 m nhẹ · 6/10','Luân phiên một lượt khá và một lượt nhẹ, lấy hơi đều; không bơi hết sức.','Không giảm số lần thở để tăng tốc.'],
 ['SWIMMING','advanced','form','Bơi kỹ thuật hồi phục',180,45,'Nhẹ · 3–4/10','Bơi kiểu quen thuộc, chú ý thân thẳng và động tác mượt, nghỉ ở thành khi cần.','Kết thúc khi vai mỏi làm biến dạng kỹ thuật.'],
 ['GYM','beginner','legpress','Leg press — đạp đùi máy',60,75,'1 hiệp × 8–12 lần','Chỉnh ghế để lưng và hông tựa chắc, đạp và hạ có kiểm soát trong tầm dễ chịu. Đủ lần thì nghỉ.','Không khóa gối hoặc để hông cuộn khỏi ghế.'],
 ['GYM','beginner','chest','Chest press — đẩy ngực máy',60,75,'1 hiệp × 8–12 lần','Tay cầm ngang ngực, lưng tựa ghế; đẩy ra khi thở ra và thu về chậm.','Không nhún vai hoặc nảy tạ.'],
 ['GYM','beginner','row','Seated row — kéo cáp ngồi',60,75,'1 hiệp × 8–12 lần','Ngực mở tự nhiên, kéo khuỷu về sau, trả tay có kiểm soát.','Không giật lưng để kéo tạ.'],
 ['GYM','beginner','bridge','Glute bridge — nâng hông',60,60,'1 hiệp × 10–12 lần','Nằm ngửa co gối, siết mông nâng hông đến khi thân thẳng rồi hạ chậm.','Không ưỡn lưng dưới ở điểm cao nhất.'],
 ['GYM','intermediate','goblet','Goblet squat',60,90,'1 hiệp × 8–10 lần','Ôm tạ trước ngực, ngồi xuống trong tầm kiểm soát, gối theo hướng ngón chân.','Giữ cả bàn chân trên sàn; không cố xuống sâu mất thăng bằng.'],
 ['GYM','intermediate','rdl','Romanian deadlift với tạ đơn',60,90,'1 hiệp × 8–10 lần','Gối mềm, đẩy hông ra sau, tạ sát chân; đứng lên bằng hông, lưng giữ ổn định.','Dừng khi không còn giữ được lưng, không cố chạm sàn.'],
 ['GYM','intermediate','incline','Đẩy ngực tạ đơn ghế dốc nhẹ',60,90,'1 hiệp × 8–10 lần','Tựa lưng chắc, hạ tạ hai bên ngực trong tầm dễ chịu rồi đẩy lên kiểm soát.','Không hạ quá sâu hoặc nhấc hông khỏi ghế.'],
 ['GYM','intermediate','pulldown','Lat pulldown — kéo xô',60,90,'1 hiệp × 8–12 lần','Giữ thân ổn định, kéo thanh về ngực trên rồi trả lên chậm.','Không kéo sau gáy hoặc đung đưa người.'],
 ['GYM','advanced','split','Split squat có tải',90,90,'1 hiệp × 8 lần mỗi bên','Hai chân so le, hạ gối sau, đẩy lên bằng chân trước; đổi bên khi đủ lần.','Giữ hông cân và chọn tải không làm mất thăng bằng.'],
 ['GYM','advanced','hinge','RDL hạ chậm',75,120,'1 hiệp × 8 lần · hạ khoảng 3 giây','Dùng tạ vừa, đẩy hông ra sau và kiểm soát pha hạ; đứng lên ổn định.','Không tăng tải cùng lúc với tăng độ chậm.'],
 ['GYM','advanced','press','Đẩy ngực tạ đơn có kiểm soát',75,120,'1 hiệp × 8–10 lần','Giữ chân và lưng ổn định, hạ chậm, đẩy đều; kết thúc khi còn dư 2 lần.','Nhờ hỗ trợ khi đưa tạ vào vị trí; không tập tới thất bại.'],
 ['GYM','advanced','single-row','Kéo tạ đơn từng bên có tựa',90,90,'1 hiệp × 8–10 lần mỗi bên','Tựa một tay lên ghế chắc, kéo khuỷu về hông rồi hạ chậm; đổi bên.','Không vặn người để nâng tạ.']
];
export const LIBRARY_EXERCISES: Exercise[] = rows.map(([category,level,slug,name,duration,restAfter,target,description,tip]) => ({
 id: 'lib-' + category.toLowerCase() + '-' + level + '-' + slug, category: category as ExerciseCategory, level, name, duration, restAfter, target, description, tip, stage: 'main', equipment: SPORTS.find(s=>s.id===category)!.equipment
}));
for (const sport of SPORTS) {
 for (const stage of ['warmup','cooldown'] as const) LIBRARY_EXERCISES.push({
  id: 'lib-' + sport.id.toLowerCase() + '-' + stage, category: sport.id as ExerciseCategory,
  name: stage === 'warmup' ? 'Khởi động · ' + sport.name : 'Thả lỏng · ' + sport.name,
  description: stage === 'warmup' ? sport.warm : sport.cool,
  duration: stage === 'warmup' ? 300 : 180 + (sport.id === 'RUNNING' ? 120 : 0), restAfter: 0, stage,
  target: 'Nhẹ · 2/10', equipment: sport.equipment
 });
}
export const TEMPLATE_PLANS: WorkoutPlan[] = SPORTS.flatMap(sport => (Object.keys(LEVELS) as TrainingLevel[]).map(level => {
 const body = LIBRARY_EXERCISES.filter(e=>e.category===sport.id && e.level===level).map(e=>e.id);
 let sequence = ['WALKING','RUNNING'].includes(sport.id) ? body : [...body,...body];
 if (sport.id === 'RUNNING' && level === 'beginner') sequence = Array.from({length:6},()=>body.slice(0,2)).flat();
 if (sport.id === 'RUNNING' && level === 'advanced') sequence = [body[2],body[0],body[1],body[0],body[1]];
 const exerciseIds = ['lib-'+sport.id.toLowerCase()+'-warmup', ...sequence, 'lib-'+sport.id.toLowerCase()+'-cooldown'];
 return { id: 'template-'+sport.id.toLowerCase()+'-'+level, name: sport.name+' · '+LEVELS[level], category: sport.id as ExerciseCategory, level,
 description: ['beginner','intermediate','advanced'].indexOf(level) === 0 ? 'Làm quen kỹ thuật và xây nền tảng.' : level === 'intermediate' ? 'Củng cố kỹ thuật, phối hợp và sức bền.' : 'Tăng độ khó có kiểm soát trên nền kỹ thuật vững.',
 guidance: sport.note + ' Hoàn thành dễ chịu và giữ kỹ thuật trước khi tăng một yếu tố: thời lượng, số hiệp hoặc tải. Có thể lặp lại mức hiện tại.',
 exerciseIds, settings: {rounds:exerciseIds.length,workTime:60,restTime:0,longRestTime:0,longRestFrequency:0}
 };
}));
export function mergeExercises(saved: Exercise[]): Exercise[] {
 const byId = new Map(LIBRARY_EXERCISES.map(e=>[e.id,e]));
 for(const exercise of saved) byId.set(exercise.id,exercise);
 return [...byId.values()];
}
export function resolvePlan(plan: WorkoutPlan, exercises: Exercise[]): Exercise[] {
 const byId = new Map(exercises.map(e=>[e.id,e]));
 return plan.exerciseIds.map(id=> { const e=byId.get(id); if(!e) throw new Error('Giáo án có bài đã bị xóa. Hãy sửa giáo án trước khi nạp.'); return e; });
}
export function restForRound(exercise: Exercise | null | undefined, settings: WorkoutSettings, round: number) {
 if (exercise?.restAfter !== undefined) return {seconds:exercise.restAfter,long:false};
 const long=settings.longRestFrequency>0 && round%settings.longRestFrequency===0;
 return {seconds:long?settings.longRestTime:settings.restTime,long};
}
export function planSeconds(plan: WorkoutPlan, exercises: Exercise[]) {
 const list=resolvePlan(plan,exercises);
 const settings=plan.settings || {rounds:list.length,workTime:60,restTime:60,longRestTime:0,longRestFrequency:0};
 return 10+list.reduce((sum,e,i)=>sum+e.duration+(i<list.length-1?restForRound(e,settings,i+1).seconds:0),0);
}
