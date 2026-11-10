using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Reflection;
using System.Text;
using System.Windows.Forms;
[assembly: AssemblyTitle("MD/TXT EasyViewer 설치")]
[assembly: AssemblyProduct("MD/TXT EasyViewer")]
[assembly: AssemblyDescription("Markdown and text viewer installer")]
[assembly: AssemblyFileVersion("1.0.0.0")]
static class Installer {
    [STAThread] static int Main() {
        string title="MD/TXT EasyViewer 설치";
        if(MessageBox.Show("MD/TXT EasyViewer를 현재 사용자에게 설치하시겠습니까?\n\n시작 메뉴와 Windows 기본 앱 선택 목록에 등록합니다. 기존 기본 앱은 바뀌지 않습니다.",title,MessageBoxButtons.OKCancel,MessageBoxIcon.Information)!=DialogResult.OK)return 0;
        string work=Path.Combine(Path.GetTempPath(),"MDTXEasyViewerSetup-"+Guid.NewGuid().ToString("N"));
        try {
            Directory.CreateDirectory(work);
            using(Stream payload=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip")) {
                if(payload==null)throw new IOException("설치 파일을 찾을 수 없습니다.");
                using(var archive=new ZipArchive(payload,ZipArchiveMode.Read)) {
                    foreach(var entry in archive.Entries) {
                        string path=Path.GetFullPath(Path.Combine(work,entry.FullName.Replace('/',Path.DirectorySeparatorChar)));
                        if(!path.StartsWith(work+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)||entry.Length>20*1024*1024)throw new IOException("올바르지 않은 설치 파일입니다.");
                        if(entry.FullName.EndsWith("/",StringComparison.Ordinal)){Directory.CreateDirectory(path);continue;}
                        Directory.CreateDirectory(Path.GetDirectoryName(path));
                        using(var input=entry.Open())using(var output=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None))input.CopyTo(output);
                    }
                }
            }
            string script=Path.Combine(work,"install.ps1");if(!File.Exists(script))throw new IOException("설치 스크립트를 찾을 수 없습니다.");
            string powershell=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),@"WindowsPowerShell\v1.0\powershell.exe");
            var info=new ProcessStartInfo(powershell,"-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \""+script+"\" -NoPause"){UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true,StandardOutputEncoding=Encoding.GetEncoding(949),StandardErrorEncoding=Encoding.GetEncoding(949)};
            using(var process=Process.Start(info)){
                string stdout=process.StandardOutput.ReadToEnd();string stderr=process.StandardError.ReadToEnd();process.WaitForExit();
                if(process.ExitCode!=0)throw new IOException((stderr+"\n"+stdout).Trim());
            }
            MessageBox.Show("설치가 완료되었습니다.\n\n시작 메뉴에서 MD TXT EasyViewer를 실행하거나 Windows 기본 앱 설정에서 선택할 수 있습니다.",title,MessageBoxButtons.OK,MessageBoxIcon.Information);
            return 0;
        } catch(Exception error) {MessageBox.Show("설치하지 못했습니다.\n\n"+error.Message,title,MessageBoxButtons.OK,MessageBoxIcon.Error);return 1;}
        finally {try{if(Directory.Exists(work))Directory.Delete(work,true);}catch{}}
    }
}
