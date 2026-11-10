using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Reflection;
using System.Text;
using System.Windows.Forms;
[assembly: AssemblyTitle("MD/TXT EasyViewer Setup")]
[assembly: AssemblyProduct("MD/TXT EasyViewer")]
[assembly: AssemblyDescription("Markdown and text viewer installer")]
[assembly: AssemblyFileVersion("1.0.0.0")]
static class Installer {
    [STAThread] static int Main() {
        string title="MD/TXT EasyViewer Setup";
        if(MessageBox.Show("Install MD/TXT EasyViewer for the current user?\n\nThe app will be added to the Start menu and Windows app choices. Existing defaults will not be changed.",title,MessageBoxButtons.OKCancel,MessageBoxIcon.Information)!=DialogResult.OK)return 0;
        string work=Path.Combine(Path.GetTempPath(),"MDTXEasyViewerSetup-"+Guid.NewGuid().ToString("N"));
        try {
            Directory.CreateDirectory(work);
            using(Stream payload=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip")) {
                if(payload==null)throw new IOException("Setup files could not be found.");
                using(var archive=new ZipArchive(payload,ZipArchiveMode.Read)) {
                    foreach(var entry in archive.Entries) {
                        string path=Path.GetFullPath(Path.Combine(work,entry.FullName.Replace('/',Path.DirectorySeparatorChar)));
                        if(!path.StartsWith(work+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)||entry.Length>20*1024*1024)throw new IOException("Invalid setup file.");
                        if(entry.FullName.EndsWith("/",StringComparison.Ordinal)){Directory.CreateDirectory(path);continue;}
                        Directory.CreateDirectory(Path.GetDirectoryName(path));
                        using(var input=entry.Open())using(var output=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None))input.CopyTo(output);
                    }
                }
            }
            string script=Path.Combine(work,"install.ps1");if(!File.Exists(script))throw new IOException("The setup script could not be found.");
            string powershell=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),@"WindowsPowerShell\v1.0\powershell.exe");
            var info=new ProcessStartInfo(powershell,"-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \""+script+"\" -NoPause"){UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true,StandardOutputEncoding=Encoding.GetEncoding(949),StandardErrorEncoding=Encoding.GetEncoding(949)};
            using(var process=Process.Start(info)){
                string stdout=process.StandardOutput.ReadToEnd();string stderr=process.StandardError.ReadToEnd();process.WaitForExit();
                if(process.ExitCode!=0)throw new IOException((stderr+"\n"+stdout).Trim());
            }
            MessageBox.Show("Installation completed.\n\nOpen MD TXT EasyViewer from the Start menu or choose it in Windows Default Apps settings.",title,MessageBoxButtons.OK,MessageBoxIcon.Information);
            return 0;
        } catch(Exception error) {MessageBox.Show("Installation failed.\n\n"+error.Message,title,MessageBoxButtons.OK,MessageBoxIcon.Error);return 1;}
        finally {try{if(Directory.Exists(work))Directory.Delete(work,true);}catch{}}
    }
}
